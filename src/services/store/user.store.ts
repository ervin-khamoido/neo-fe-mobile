import { injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { Bank, BankAccount, User } from '../../models'
import { UserSettings, UserStatus } from '../../models/user-settings'
import { WaitlistItem } from '../../models/waitlist'
import { ValidateDeleteUserAccountOutput } from '../../models/output/validate-delete-user-account-output'
import { cleanable, ICleanable } from '../../utils/sanitizer'

import { WaitlistFeature } from '../waitlist.service'

export interface IUserStore {
  readonly me: User | null

  readonly users: User[]
  readonly userBanks: BankAccount[]
  readonly banks: Bank[]
  readonly settings: UserSettings | null
  readonly userStatus: UserStatus | null

  setMe(user: User): void
  setInvitationLink(invitationLink: string): void
  setUserBanks(banks: Array<Object>): void
  setBanks(banks: Array<Object>): void
  setSettings(settings: UserSettings): void
  switchAppLock(enable: boolean): void

  setUserStatus(userStatus: UserStatus): void

  get(uid: string): User | undefined
  add(user: User): void
  exists(uid: string): boolean

  // delete user feature
  readonly deleteValidateResult: ValidateDeleteUserAccountOutput | null
  setDeleteValidateResult(result: ValidateDeleteUserAccountOutput): void
  resetDeleteValidateResult(): void

  // user's waitlist
  readonly waitlist: WaitlistItem[]
  readonly waitlistVersion: number
  setWaitlist(value: WaitlistItem[]): void
  setWaitlistVersion(value: number): void
  pushWaitlistItem(feature: WaitlistFeature): void
}

export const UserStoreSymbol = Symbol.for('IUserStore')

@cleanable
@injectable()
export class UserStore implements IUserStore, ICleanable {
  @observable uids = observable.set<string>()
  @observable usersMap = observable.map<string, User>()
  @observable userBanks: BankAccount[]
  @observable banks: Bank[]

  @observable settings: UserSettings | null = null
  @observable userStatus: UserStatus | null = null

  @observable me: User | null = null

  @computed get users() {
    return [...this.usersMap.values()]
  }

  @observable waitlist: WaitlistItem[] = []
  @observable waitlistVersion: number = 0

  constructor() {
    makeObservable(this)
  }

  @action setMe(user: User): void {
    this.me = user
  }

  @action setInvitationLink(invitationLink: string): void {
    this.me.invitationLink = invitationLink
  }

  @action setUserBanks(banks: BankAccount[]): void {
    this.userBanks = banks
  }

  @action setBanks(banks: Bank[]): void {
    this.banks = banks
  }

  @action setSettings(settings: UserSettings): void {
    this.settings = settings
  }

  @action switchAppLock(enable: boolean): void {
    this.settings = {
      ...this.settings,
      enableAppLock: enable,
    }
  }

  @action setUserStatus(userStatus: UserStatus): void {
    this.userStatus = userStatus
  }

  @action add(user: User): void {
    this.uids.add(user.uid)
    this.usersMap.set(user.uid, user)
  }

  get(uid: string): User | undefined {
    return this.usersMap.get(uid)
  }

  exists(uid: string): boolean {
    return this.uids.has(uid)
  }

  @action clean() {
    this.me = null
    this.uids.clear()
    this.usersMap.clear()
    this.userBanks = []
    this.settings = null
    this.userStatus = null
    this.waitlist = []
  }

  // delete user feature

  @observable deleteValidateResult: ValidateDeleteUserAccountOutput | null = null

  @action setDeleteValidateResult(result: ValidateDeleteUserAccountOutput): void {
    this.deleteValidateResult = result
  }

  @action resetDeleteValidateResult(): void {
    this.deleteValidateResult = null
  }

  // waitlist feature
  @action setWaitlist(value: WaitlistItem[]): void {
    this.waitlist = value
  }

  @action setWaitlistVersion(value: number): void {
    this.waitlistVersion = value
  }

  @action pushWaitlistItem(feature: WaitlistFeature): void {
    this.waitlist.push({
      feature: feature,
      enabled: false,
    })
  }
}
