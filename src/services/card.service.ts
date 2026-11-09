import { inject, injectable, named } from 'inversify'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { reaction } from 'mobx'

import read, { readable } from '@ts-awesome/model-reader'

import { IssueCardInput } from '../models/input/issue-card.input'
import {
  PostEntityOutput,
  VerifyOutput,
  FundCardInput,
  UnloadCardInput,
  UserBalance,
  CardIssueInfo,
  VirtualCardDetails,
  VirtualCardStatus,
  VirtualCardStatusInfo,
} from '../models'

import { ApiServiceSymbol, IApiService } from './api.service'
import { IUserStore, UserStoreSymbol } from './store/user.store'
import { IVirtualCardStore, VirtualCardStoreSymbol } from './store/virtual-card.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ConnectionError, RequestError } from '@ts-awesome/request'
import { StatusCode } from '../common/constrants'

export interface ICardService {
  initialize(): void

  syncCardBalance(): Promise<void>

  issueVirtualCard(payload: IssueCardInput): Promise<void>
  syncVirtualCardStatus(): Promise<void>
  syncVirtualCardDetails(): Promise<void>

  fundVirtualCard(payload: FundCardInput): Promise<void>
  unloadVirtualCard(payload: UnloadCardInput): Promise<void>

  freezeCard(): Promise<void>
  unfreezeCard(): Promise<void>

  verifyVirtualCardIssuance(): Promise<VerifyOutput>
  syncCardIssueInfo(): Promise<void>
}

export const CardServiceSymbol = Symbol.for('ICardService')

@injectable()
export class CardService implements ICardService {
  @inject(AppMonitoringServiceSymbol) @named('CardService') monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(VirtualCardStoreSymbol) virtualCardStore!: IVirtualCardStore

  private _subscriptions: (() => void)[] = []

  initialize(): void {
    reaction(
      () => this.userStore.me?.uid,
      user => {
        if (user) {
          this.subscribe()
        } else {
          this.unsubscribe()
        }
      },
    )
  }

  async syncCardBalance(): Promise<void> {
    const userBalance = await this.api.withAuth(http => http.get('/api/v1/user/card-balance', { Model: UserBalance }))

    // TODO: this will cause the approximation issue!!!
    // userBalance.balance = floorAmount(userBalance.balance, TWO_DECIMAL_CONFIG)

    this.virtualCardStore.setBalance(userBalance.balance)
  }

  async issueVirtualCard(payload: IssueCardInput): Promise<void> {
    const body = { ...payload }

    const _unused = await this.api.withAuth(http =>
      http.post('/api/v1/card', {
        body: body,
        Model: PostEntityOutput,
      }),
    )

    this.virtualCardStore.setCardStatus({ status: VirtualCardStatus.Cardholder_VerificationPending })
  }

  async fundVirtualCard(payload: FundCardInput): Promise<void> {
    const body = { ...payload }

    await this.api.withAuth(http =>
      http.post('/api/v1/card/fund', {
        body: body,
        oneTimeAction: true,
      }),
    )
  }

  async unloadVirtualCard(payload: UnloadCardInput): Promise<void> {
    const body = { ...payload }

    await this.api.withAuth(http =>
      http.post('/api/v1/card/unload', {
        body: body,
      }),
    )
  }

  async freezeCard(): Promise<void> {
    await this.api.withAuth(http => http.patch('/api/v1/card/freeze'))
  }

  async unfreezeCard(): Promise<void> {
    await this.api.withAuth(http =>
      http.patch('/api/v1/card/unfreeze', {
        oneTimeAction: true,
        fireTokenForceRefresh: true,
      }),
    )
  }

  async verifyVirtualCardIssuance(): Promise<VerifyOutput> {
    return await this.api.withAuth(http =>
      http.get('/api/v1/card/verify-card-issue', {
        Model: VerifyOutput,
      }),
    )
  }

  async syncVirtualCardStatus(): Promise<void> {
    try {
      const result = await this.api.withAuth(http =>
        http.get('/api/v1/user/card/status', {
          Model: VirtualCardStatusInfo,
        }),
      )

      this.virtualCardStore.setCardStatus(result)
    } catch (err: any) {
      this.monitoring.exception(err)
    }
  }

  async syncVirtualCardDetails(): Promise<void> {
    try {
      const result = await this.api.withAuth(http =>
        http.get('/api/v1/user/card', {
          Model: VirtualCardDetails,
        }),
      )

      this.virtualCardStore.setCardDetails(result)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.ServerError:
            // ignore
            break
          case StatusCode.NotFound:
            // ignore
            break
          default:
            this.monitoring.exception(err)
        }
      } else {
        this.monitoring.exception(err)
      }
    }
  }

  async syncCardIssueInfo(): Promise<void> {
    try {
      const result = await this.api.withAuth(http => http.get('/api/v1/card/issue-info', { Model: CardIssueInfo }))

      this.virtualCardStore.setCardIssueInfo(result)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.ServerError:
            // ignore
            break
          default:
            this.monitoring.exception(err)
        }
      } else {
        this.monitoring.exception(err)
      }
    }
  }

  private subscribe(): void {
    const { me: user } = this.userStore
    this.monitoring.assert(user, 'Expected a this.userStore.me to be not null')

    if (!user) {
      return
    }

    const sub1 = firestore().collection<UserInfo>('user').doc(user.fireUserId).onSnapshot(this.onSnapshot, this.onError)
    const sub2 = firestore()
      .doc<UserCardBalance>(`user/${user.fireUserId}`)
      .onSnapshot(
        async x => {
          const currentVersion = this.virtualCardStore.balanceVersion
          const data = read(x.data(), UserCardBalance)
          const remoteVersion = data?.cardBalance?.version

          if (!remoteVersion || currentVersion < remoteVersion) {
            await this.syncCardBalance()
            this.virtualCardStore.setBalanceVersion(remoteVersion)
          }
        },
        e => {
          this.monitoring.exception(`User firebase subscription error: [${e.name}] ${e.message}\n${e.stack}`)
        },
      )

    this._subscriptions.push(sub1, sub2)
  }

  private onSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { card } = read(snapshot.data(), UserInfo) ?? {}

    const { cardStatusVersion: currentVersion } = this.virtualCardStore
    if (currentVersion && card && card.version <= currentVersion) {
      return
    }

    this.virtualCardStore.setCardStatusVersion(card?.version ?? null)
    await Promise.all([
      this.syncVirtualCardStatus(),
      this.syncVirtualCardDetails(),
      //
    ])
  }

  private onError = (err: Error) => {
    this.monitoring.exception(err)
  }

  private unsubscribe(): void {
    for (const sub of this._subscriptions) {
      sub?.()
    }
    this._subscriptions = []
  }
}

class VirtualCardInfo {
  @readable(Number) version!: number
}

class UserInfo {
  @readable(VirtualCardInfo, true) card?: VirtualCardInfo | null
}

class CardBalanceInfo {
  @readable(Number) version!: number
}

class UserCardBalance {
  @readable(CardBalanceInfo, true) cardBalance?: CardBalanceInfo | null
}
