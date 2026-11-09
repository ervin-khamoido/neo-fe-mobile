import { inject, injectable, named } from 'inversify'

import { IUserStore, UserStoreSymbol } from './store/user.store'
import { User, Bank, IAddress } from '../models'
import { ApiServiceSymbol, IApiService } from './api.service'

import { BankAccountInput, InviteInput } from '../models/input'
import { PostEntityOutput } from '../models/output'

import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ValidateBankAccountOutput } from '../models/output/validate-bank-account.output'
import { UserSettings, UserStatus } from '../models/user-settings'
import { readable } from '@ts-awesome/model-reader'
import { ValidateDeleteUserAccountOutput } from '../models/output/validate-delete-user-account-output'
import { SimpleDate } from '../lib/utils/simple-date'
import { UserSearchOutput } from '../models/output/user-search.output'
import { ConnectionError } from '@ts-awesome/request'

export interface IUserService {
  syncMe(): Promise<void>
  syncInvitationLink(): Promise<void>
  syncBankAccounts(): Promise<void>
  syncBanks(): Promise<void>

  invite(payload: InviteInput): Promise<void>
  addBankAccount(payload: BankAccountInput): Promise<string>
  sendDeleteUserBankAccounts(userBanksUid: string[]): Promise<void>

  validateUserAccount(payload: BankAccountInput): Promise<ValidateBankAccountOutput>
  validateDeleteUserAccount(): Promise<void>

  syncSettings(): Promise<void>
  syncUserStatus(): Promise<void>

  sendDeleteUserAccount(): Promise<void>

  // user details apis
  createUsername(value: string): Promise<void>
  createFullName(firstName: string, lastName: string, middleName?: string): Promise<void>
  createDoB(value: Date): Promise<void>
  createAddress(address: IAddress): Promise<void>

  search(value: string): Promise<UserSearchOutput[]>
}

export const UserServiceSymbol = Symbol.for('IUserService')

@injectable()
export class UserService implements IUserService {
  @inject(AppMonitoringServiceSymbol) @named('UserService') monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserStoreSymbol) userStore!: IUserStore

  async syncMe(): Promise<void> {
    const user = await this.api.withAuth(http => http.get('/api/v2/user/me', { Model: User }))
    this.userStore.setMe(user)
  }

  async syncInvitationLink(): Promise<void> {
    const invitationLink = await this.api.withAuth(http => http.get('/api/v1/user/invitation-link', { Model: String }))
    this.userStore.setInvitationLink(invitationLink.toString())
  }

  async syncSettings(): Promise<void> {
    const settings = await this.api.withAuth(http => http.get('/api/v1/user/settings', { Model: UserSettings }))

    this.userStore.setSettings(settings)
  }

  // DEPRECATED: Get Invitation Link Instead
  async invite(payload: InviteInput): Promise<void> {
    const body = { ...payload }
    const invitation = await this.api.withAuth(http =>
      http.post('/api/v1/user/invite', { Model: PostEntityOutput, body }),
    )
  }

  async syncBankAccounts(): Promise<void> {
    //TODO: implement model when bankName is added to returned objects in bankaccounts array
    const userBanks = await this.api.withAuth(http => http.get('/api/v1/user/bank-account'))

    this.userStore.setUserBanks(userBanks as any)
  }

  async syncBanks(): Promise<void> {
    const banks = await this.api.withAuth(http => http.get<[Bank]>('/api/v1/bank', { Model: [Bank] }))
    banks.sort(function (a, b) {
      const aName = a.name.toLocaleLowerCase()
      const bName = b.name.toLocaleLowerCase()
      return aName.localeCompare(bName)
    })

    this.userStore.setBanks(banks)
  }

  async addBankAccount(payload: BankAccountInput): Promise<string> {
    const body = { ...payload }
    const result = await this.api.withAuth(http =>
      http.post('/api/v1/user/bank-account', { Model: PostEntityOutput, body }),
    )
    return result.uid
  }

  async validateUserAccount(payload: BankAccountInput): Promise<ValidateBankAccountOutput> {
    const body = { ...payload }
    return this.api.withAuth(http =>
      http.post('/api/v1/user/bank-account/validate', {
        body,
        Model: ValidateBankAccountOutput,
      }),
    )
  }

  async sendDeleteUserBankAccounts(userBankUids: string[]): Promise<void> {
    const body = { userBanks: userBankUids }
    await this.api.withAuth(
      http =>
        http.post('/api/v1/user/bank-account/batch-delete', {
          body: body,
        }),
      //
    )
  }

  async syncUserStatus(): Promise<void> {
    class UserStatusResponse {
      @readable(String) status!: UserStatus
    }

    const response = await this.api.withAuth(http => http.get('api/v1/user/status', { Model: UserStatusResponse }))

    this.userStore.setUserStatus(response.status)
  }

  async validateDeleteUserAccount(): Promise<void> {
    const result = await this.api.withAuth(http =>
      http.get('/api/v1/user/delete/validate', { Model: ValidateDeleteUserAccountOutput }),
    )

    this.userStore.setDeleteValidateResult(result)
  }

  async sendDeleteUserAccount(): Promise<void> {
    await this.api.withAuth(http =>
      http.delete('/api/v1/user/delete/confirm', { oneTimeAction: true, fireTokenForceRefresh: true }),
    )
  }

  async createUsername(value: string): Promise<void> {
    const body = { username: value }

    await this.api.withAuth(http =>
      http.post('/api/v1/user/details/username', {
        body: body,
      }),
    )
  }

  async createFullName(firstName: string, lastName: string, middleName?: string): Promise<void> {
    const body = { firstName, middleName, lastName }

    await this.api.withAuth(http =>
      http.post('/api/v1/user/details/full-name', {
        body: body,
      }),
    )
  }

  async createDoB(value: Date): Promise<void> {
    const body = { dateOfBirth: new SimpleDate(value) }

    await this.api.withAuth(http =>
      http.post('/api/v1/user/details/dob', {
        body: body,
      }),
    )
  }

  async createAddress(address: IAddress): Promise<void> {
    const body = { ...address }

    await this.api.withAuth(http =>
      http.post('/api/v1/user/details/address', {
        body: body,
      }),
    )
  }

  async search(value: string): Promise<UserSearchOutput[]> {
    try {
      const qs = new URLSearchParams({ qs: value })
      return await this.api.withAuth(http =>
        http.get<UserSearchOutput[]>(`/api/v1/user/search?${qs}`, { Model: [UserSearchOutput] }),
      )
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }

      return []
    }
  }
}
