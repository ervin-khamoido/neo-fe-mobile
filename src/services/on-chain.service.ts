import { inject, injectable, named } from 'inversify'
import { reaction } from 'mobx'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import read, { readable } from '@ts-awesome/model-reader'

import { IncomingCryptoAddressOutput } from '../models/output/incoming-crypto-address.output'
import {
  CalculatedOnChainOrderOutput,
  CalculateOnChainOrderInput,
  OnChainOrderInput,
  PostEntityOutput,
  VerifyCryptoAddressBody,
  VerifyCryptoAddressOutput,
} from '../models'

import { ApiServiceSymbol, IApiService } from './api.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

import { IOnChainStore, OnChainStoreSymbol } from './store/on-chain.store'
import { IUserStore, UserStoreSymbol } from './store/user.store'
import { RemoteConfig } from './remote-config.service'
import { FeatureAccessFactory, FeatureAccessFactorySymbol, IFeatureAccess } from '../utils/feature-access'
import { WaitlistFeature } from './waitlist.service'
import { ConnectionError } from '@ts-awesome/request'

export interface IOnChainService {
  initialize(): void

  syncIncomingCryptoAddress(): Promise<void>
  verifyCryptoAddress(body: VerifyCryptoAddressBody): Promise<VerifyCryptoAddressOutput>
  calculateCurrentOnChainOrder(body: CalculateOnChainOrderInput): Promise<void>
  createOnChainOrder(payload: OnChainOrderInput): Promise<string>
}

export const OnChainServiceSymbol = Symbol.for('IOnChainService')

@injectable()
export class OnChainService implements IOnChainService {
  @inject(AppMonitoringServiceSymbol) @named('OnChainService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(FeatureAccessFactorySymbol) featureAccessFactory!: FeatureAccessFactory

  @inject(OnChainStoreSymbol) onChainStore!: IOnChainStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  private _subscription: (() => void) | null
  private _featureAccess: IFeatureAccess

  initialize(): void {
    this._featureAccess = this.featureAccessFactory(
      RemoteConfig.ReceiveOnChain,
      RemoteConfig.ReceiveOnChainWaitlist,
      WaitlistFeature.OnChain_Receive,
    )

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

  async syncIncomingCryptoAddress(): Promise<void> {
    const result = await this.api.withAuth(http =>
      http.get('/api/v3/on-chain/incoming-crypto-address', { Model: IncomingCryptoAddressOutput }),
    )

    this.onChainStore.setIncomingCryptoAddress(result.address)
  }

  async verifyCryptoAddress(payload: VerifyCryptoAddressBody): Promise<VerifyCryptoAddressOutput> {
    const body = { ...payload }

    try {
      return await this.api.withAuth(http =>
        http.post('/api/v1/on-chain/address/validate', { Model: VerifyCryptoAddressOutput, body }),
      )
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }
    }
  }

  async calculateCurrentOnChainOrder(body: CalculateOnChainOrderInput): Promise<void> {
    const order = await this.api.withAuth(http =>
      http.post('/api/v1/calculate/order/on-chain', { Model: CalculatedOnChainOrderOutput, body }),
    )

    this.onChainStore.setCurrentOnChainOrder(order)
  }

  async createOnChainOrder(payload: OnChainOrderInput): Promise<string> {
    const body = { ...payload }
    const result = await this.api.withAuth(http =>
      http.post('/api/v1/order/on-chain', { Model: PostEntityOutput, body, oneTimeAction: true }),
    )

    return result.uid
  }

  private subscribe(): void {
    const { me: user } = this.userStore
    this.monitoring.assert(user, 'Expected a this.userStore.me to be not null')

    if (!user) {
      return
    }

    this._subscription = firestore()
      .collection<UserInfo>('user')
      .doc(user.fireUserId)
      .onSnapshot(this.onSnapshot, this.onError)
  }

  private unsubscribe(): void {
    this._subscription?.()
  }

  private onSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { incomingAddress } = read(snapshot.data(), UserInfo) ?? {}

    const { incomingAddressVersion: currentVersion } = this.onChainStore
    if (currentVersion && incomingAddress && incomingAddress.version <= currentVersion) {
      return
    }

    this.onChainStore.setIncomingAddressVersion(incomingAddress?.version ?? null)

    if (this._featureAccess?.isFeatureEnabled) {
      if (!this._featureAccess?.showWaitlist) {
        await this.syncIncomingCryptoAddress()
      }
    }
  }

  private onError = (err: Error) => {
    this.monitoring.exception(err)
  }
}

class IncomingAddressInfo {
  @readable(Number) version!: number
}

class UserInfo {
  @readable(IncomingAddressInfo, true) incomingAddress?: IncomingAddressInfo | null
}
