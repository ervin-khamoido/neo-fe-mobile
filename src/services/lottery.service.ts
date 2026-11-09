import { inject, injectable } from 'inversify'
import { reaction } from 'mobx'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import read, { readable } from '@ts-awesome/model-reader'

import { Lottery, LotteryWinner } from '../models'
import { ApiServiceSymbol, IApiService } from './api.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { UserLockInfo } from './lock.service'

import { IUserStore, UserStoreSymbol } from './store/user.store'
import { ILotteryStore, LotteryStoreSymbol } from './store/lottery.store'
import { ILockStore, LockStoreSymbol } from './store/lock.store'
import { ConnectionError } from '@ts-awesome/request'

export interface ILotteryService {
  initialize(): void

  syncLottery(): Promise<void>
  markLatestLotteryDrawResultsAsSeen(): Promise<void>
}

export const LotteryServiceSymbol = Symbol.for('ILotteryService')

@injectable()
export class LotteryService implements ILotteryService {
  @inject(LotteryStoreSymbol) lotteryStore!: ILotteryStore
  @inject(LockStoreSymbol) lockStore!: ILockStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

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

  async syncLottery() {
    try {
      const lottery = await this.api.withAuth(http => http.get('/api/v1/lottery', { Model: Lottery }))
      this.lotteryStore.setLottery(lottery)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }
    } finally {
      this.lotteryStore.setPending(false)
    }
  }

  async syncLotteryWinner(lotteryDraw: string): Promise<void> {
    try {
      const winner = await this.api.withAuth(http =>
        http.get(`/api/v1/lottery/result/${lotteryDraw}/me`, { Model: LotteryWinner }),
      )

      this.lotteryStore.setLotteryWinner(winner)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }
    }
  }

  async markLatestLotteryDrawResultsAsSeen(): Promise<void> {
    const { me: user } = this.userStore
    if (!user) {
      return
    }

    const globalUserInfoDoc = await firestore().collection<GlobalUserInfo>('user').doc('global').get()
    const { lottery: globalLotteryInfo } = globalUserInfoDoc.data()
    if (globalLotteryInfo?.latestLotteryUid) {
      await firestore()
        .collection('user')
        .doc(user.fireUserId)
        .set(
          {
            lotteryDraw: {
              [globalLotteryInfo.latestLotteryUid]: new Date(),
            },
          },
          { merge: true },
        )
        .catch(err => {
          this.monitoring.exception(err)
        })
      this.lotteryStore.setLatestLotteryDrawResultsSeen(true)
    }
  }

  async syncIsLatestLotteryDrawResults(): Promise<void> {
    const { me: user } = this.userStore
    if (!user) {
      return
    }

    const globalUserInfoDoc = await firestore().collection<GlobalUserInfo>('user').doc('global').get()
    const { lottery: globalLotteryInfo } = globalUserInfoDoc.data()
    if (globalLotteryInfo?.latestLotteryUid) {
      await this.syncLotteryWinner(globalLotteryInfo?.latestLotteryUid)

      const userInfo = await firestore()
        .collection<UserInfo>('user')
        .doc(user.fireUserId)
        .get()
        .catch(err => {
          this.monitoring.exception(err)
          return null
        })

      const seenAt = userInfo.data()?.lotteryDraw?.[globalLotteryInfo?.latestLotteryUid] ?? null
      this.lotteryStore.setLatestLotteryDrawResultsSeen(!!seenAt)
    }
  }

  private subscribe(): void {
    const { me: user } = this.userStore
    if (!user) {
      return
    }

    const sub1 = firestore()
      .collection<UserInfo>('user')
      .doc(user.fireUserId)
      .onSnapshot(this.onUserLotterySnapshot, this.onError)
    const sub2 = firestore().collection('user').doc('global').onSnapshot(this.onLotterySnapshot, this.onError)
    const sub3 = firestore()
      .collection<UserLockInfo>('user')
      .doc(user.fireUserId)
      .onSnapshot(this.onLockSnapshot, this.onError)
    this._subscriptions.push(sub1, sub2, sub3)
  }

  private onUserLotterySnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { lottery } = read(snapshot.data(), UserInfo) ?? {}

    const { userLotteryVersion: currentVersion } = this.lotteryStore
    if (currentVersion && lottery && lottery.version <= currentVersion) {
      return
    }

    this.lotteryStore.setUserLotteryVersion(lottery?.version ?? 0)
    await this.syncLottery()
  }

  private onLotterySnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { lottery } = read(snapshot.data(), GlobalUserInfo) ?? {}

    const { lotteryVersion: currentVersion } = this.lotteryStore
    if (currentVersion && lottery && lottery.version <= currentVersion) {
      return
    }

    this.lotteryStore.setLotteryVersion(lottery?.version ?? 0, lottery?.latestLotteryUid ?? null)
    await Promise.all([
      this.syncIsLatestLotteryDrawResults(),
      this.syncLottery(),
      //
    ])
  }

  private onLockSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserLockInfo>) => {
    const { locks } = read(snapshot.data(), UserLockInfo) ?? {}

    const { locksVersion: currentVersion } = this.lockStore
    if (currentVersion && locks && locks.version <= currentVersion) {
      return
    }

    this.lockStore.setLocksVersion(locks?.version ?? 0)
    await this.syncLottery()
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

class UserLotteryInfo {
  @readable(Number) version!: number;

  [key: string]: string | number
}

class UserInfo {
  @readable(UserLotteryInfo, true) lottery?: UserLotteryInfo | null
  @readable(Object, true) lotteryDraw?: Record<string, string> | null
}

class GlobalLotteryInfo {
  @readable(Number) version!: number
  @readable(String, true) latestLotteryUid!: string
}

class GlobalUserInfo {
  @readable(GlobalLotteryInfo, true) lottery?: GlobalLotteryInfo
}
