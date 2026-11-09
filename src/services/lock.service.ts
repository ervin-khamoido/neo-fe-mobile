import { inject, injectable } from 'inversify'
import { ApiServiceSymbol, IApiService } from './api.service'
import { LockInput, Lock, LockOrderInput, PostEntityOutput } from '../models'
import { ILockStore, LockStoreSymbol } from './store/lock.store'
import { reaction } from 'mobx'
import { IUserStore, UserStoreSymbol } from './store/user.store'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import read, { readable } from '@ts-awesome/model-reader'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

export interface ILockService {
  initialize(): void

  syncLocks(): Promise<void>
  createLock(body: LockInput): Promise<string>
  depositLock(body: LockOrderInput): Promise<void>
  withdrawLock(body: LockOrderInput): Promise<void>
}

export const LockServiceSymbol = Symbol.for('ILockService')

@injectable()
export class LockService implements ILockService {
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(LockStoreSymbol) lockStore!: ILockStore

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

  async syncLocks(): Promise<void> {
    const locks = await this.api.withAuth(http => http.get<Lock[]>('/api/v1/locks', { Model: [Lock] }))

    this.lockStore.setLocks(locks)
  }

  async createLock(payload: LockInput): Promise<string> {
    const body = { ...payload }
    const { uid } = await this.api.withAuth(http =>
      http.post<PostEntityOutput>('/api/v1/lock', { Model: PostEntityOutput, body }),
    )

    await this.syncLocks()

    return uid
  }

  async depositLock(payload: LockOrderInput): Promise<void> {
    const body = { ...payload }
    await this.api.withAuth(http => http.post('/api/v1/lock/deposit', { body }))

    await this.syncLocks()
  }

  async withdrawLock(payload: LockOrderInput): Promise<void> {
    const body = { ...payload }
    await this.api.withAuth(http => http.post('/api/v1/lock/withdraw', { body }))

    await this.syncLocks()
  }

  private subscribe(): void {
    const { me: user } = this.userStore
    if (!user) {
      return
    }

    const sub1 = firestore()
      .collection<UserLockInfo>('user')
      .doc(user.fireUserId)
      .onSnapshot(this.onSnapshot, this.onError)
    this._subscriptions.push(sub1)
  }

  private onSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserLockInfo>) => {
    const { locks } = read(snapshot.data(), UserLockInfo) ?? {}

    const { locksVersion: currentVersion } = this.lockStore
    if (currentVersion && locks && locks.version <= currentVersion) {
      return
    }

    this.lockStore.setLocksVersion(locks?.version ?? 0)
    await this.syncLocks()
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

export class LocksInfo {
  @readable(Number) version!: number
}

export class UserLockInfo {
  @readable(LocksInfo, true) locks?: LocksInfo | null
}
