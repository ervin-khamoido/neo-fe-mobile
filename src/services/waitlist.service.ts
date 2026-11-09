2021

import { inject, injectable, named } from 'inversify'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { WaitlistItem } from '../models/waitlist'
import { isServerError } from '../utils/helpers'

import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ApiServiceSymbol, IApiService } from './api.service'
import { IUserStore, UserStoreSymbol } from './store/user.store'
import { reaction } from 'mobx'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import read, { readable } from '@ts-awesome/model-reader'

export const WaitlistServiceSymbol = Symbol.for('IWaitlistService')

export interface IWaitlistService {
  initialize(): void

  syncWaitlist(): Promise<void>
  applyForWaitlist(feature: WaitlistFeature): Promise<void>
}

@injectable()
export class WaitlistService implements IWaitlistService {
  @inject(AppMonitoringServiceSymbol) @named('WaitlistService') monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserStoreSymbol) userStore!: IUserStore

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

  async syncWaitlist(): Promise<void> {
    try {
      const result = await this.api.withAuth(http =>
        http.get<WaitlistItem[]>('/api/v1/waitlist', { Model: [WaitlistItem] }),
      )

      this.userStore.setWaitlist(result)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else if (err instanceof RequestError && isServerError(err.statusCode)) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }
    }
  }

  async applyForWaitlist(feature: WaitlistFeature): Promise<void> {
    try {
      await this.api.withAuth(http => http.post<WaitlistItem[]>('/api/v1/waitlist', { body: { feature } }))

      this.userStore.pushWaitlistItem(feature)
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else if (err instanceof RequestError && isServerError(err.statusCode)) {
        // ignore
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

    const sub = firestore().collection<UserInfo>('user').doc(user.fireUserId).onSnapshot(this.onSnapshot, this.onError)
    this._subscriptions.push(sub)
  }

  private onSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { waitlist } = read(snapshot.data(), UserInfo) ?? {}

    const { waitlistVersion: currentVersion } = this.userStore
    if (currentVersion && waitlist && waitlist.version <= currentVersion) {
      return
    }

    this.userStore.setWaitlistVersion(waitlist?.version ?? null)
    await this.syncWaitlist()
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

export enum WaitlistFeature {
  VirtualCard = 'virtual_card',
  OnChain_Receive = 'on_chain_receive',
  OnChain_Send = 'on_chain_send',
}

class WaitlistInfo {
  @readable(Number) version!: number
}

class UserInfo {
  @readable(WaitlistInfo, true) waitlist?: WaitlistInfo | null
}
