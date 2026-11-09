import { inject, injectable, named } from 'inversify'
import { isAfter, isBefore } from 'date-fns'
import firestore from '@react-native-firebase/firestore'
import read from '@ts-awesome/model-reader'

import { UserBalance, YieldBalance } from '../models'
import { ApiServiceSymbol, IApiService } from './api.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

import { IUserStore, UserStoreSymbol } from './store/user.store'
import { UserFS } from '../models/firestore'
import { IWalletStore, WalletStoreSymbol } from './store/wallet.store'
import { FORCE_YIELD_CACHE_UPDATE_AT } from '../common/constrants'
import { floorAmount, TWO_DECIMAL_CONFIG } from '../utils/amount'
import { reaction } from 'mobx'

export interface IWalletService {
  initialize(): void
  syncBalance(version: number): Promise<void>
}

export const WalletServiceSymbol = Symbol.for('IWalletService')

@injectable()
export class WalletService implements IWalletService {
  @inject(AppMonitoringServiceSymbol) @named('WalletService') monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore

  private _subscription: () => void | null = null

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

  subscribe(): void {
    this.monitoring.assert(this.userStore.me, 'Expected a current user exists')
    if (!this.userStore.me) {
      return
    }

    const fireUserId = this.userStore.me.fireUserId
    const document = firestore().doc<UserFS>(`user/${fireUserId}`)

    this._subscription = document.onSnapshot(
      async x => {
        const data = read(x.data(), UserFS)

        await this.updateBalance(data)
        await this.updateYieldBalance(data)
      },
      e => {
        this.monitoring.exception(`User firebase subscription error: [${e.name}] ${e.message}\n${e.stack}`)
      },
    )
  }

  unsubscribe(): void {
    if (this._subscription) {
      this._subscription()
      this._subscription = null
    }
  }

  async syncBalance(version: number): Promise<void> {
    const userBalance = await this.api.withAuth(http => http.get('/api/v1/user/balance', { Model: UserBalance }))

    // https://neobank.atlassian.net/browse/NEOBANK-698
    userBalance.balance = floorAmount(userBalance.balance, TWO_DECIMAL_CONFIG)

    this.walletStore.setBalance(userBalance, version)
  }

  async syncYieldBalance(): Promise<void> {
    const syncDate = new Date()
    const yieldBalance = await this.api.withAuth(http =>
      http.get('/api/v1/user/yield/balance', { Model: YieldBalance }),
    )

    // https://neobank.atlassian.net/browse/NEOBANK-698
    yieldBalance.balance = floorAmount(yieldBalance.balance, TWO_DECIMAL_CONFIG)

    this.walletStore.setYieldBalance(yieldBalance, syncDate)
  }

  private async updateBalance(data: UserFS) {
    let currentServerVersion = data?.balance?.version

    if (!currentServerVersion) {
      currentServerVersion = -1
    }

    if (!this.walletStore.balanceVersion || currentServerVersion > this.walletStore.balanceVersion) {
      await this.syncBalance(currentServerVersion)
    }
  }

  private async updateYieldBalance(data: UserFS) {
    const { yieldBalanceUpdatedAt: updatedAt } = this.walletStore
    const fsUpdatedAt = data?.yieldBalance?.updatedAt

    const now = new Date()
    const forceUpdateDate = new Date()
    // the date is preserved and hours,mins,secs,milis are set to specific time in UTC
    forceUpdateDate.setUTCHours(...FORCE_YIELD_CACHE_UPDATE_AT)

    const isForceUpdateNeeded = updatedAt && isBefore(updatedAt, forceUpdateDate) && isBefore(forceUpdateDate, now)
    const isFirestoreDateUpdated = updatedAt && fsUpdatedAt && isAfter(fsUpdatedAt, updatedAt)

    if (!updatedAt) {
      await this.syncYieldBalance()
    } else if (isForceUpdateNeeded) {
      await this.syncYieldBalance()
    } else if (isFirestoreDateUpdated) {
      await this.syncYieldBalance()
    } else {
      // ignore even if firestore does not have a timestamp
    }
  }
}
