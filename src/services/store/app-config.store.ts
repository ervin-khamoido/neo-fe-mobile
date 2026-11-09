import { inject, injectable } from 'inversify'
import { action, makeObservable, observable, observe, computed } from 'mobx'
import { formatISO, parseISO } from 'date-fns'
import read from '@ts-awesome/model-reader'

import { AppConfig, OnboardingType } from '../../models'
import { TransactionAvailabilityInfo } from '../../models/transaction-availability'
import { PersistanceSymbol } from '../../lib/utils/persistance'
import { RemoteConfig } from '../remote-config.service'

export interface IAppConfigStore {
  readonly config: AppConfig
  readonly onboarded: boolean

  readonly minSupportedAppVersion: string
  readonly isAppUpdateSkipped: boolean

  // TODO: refactor. implement "cacheable" decorator. Task: [NEOBANK-802]
  readonly transactionAvailabilityInfo: TransactionAvailabilityInfo
  readonly transactionAvailabilityInfoUpdatedAt: Date | null

  readonly isOnboardingSeen: Record<OnboardingType, boolean>

  setOnboarding(state: boolean): void
  set(value: AppConfig): void
  setTransactionAvailabilityInfo(value: TransactionAvailabilityInfo, updatedAt: Date): void

  setIsAppUpdateSkipped(value: boolean): void

  // root navigator management
  currentRootView: RootViewName | null
  setCurrentRootView(value: RootViewName | null): void

  // remote config
  remoteConfig: Record<RemoteConfig, string | number | boolean>
  mergeRemoteConfig(value: Record<RemoteConfig, string | number | boolean>): void

  setOnboardingSeen(type: OnboardingType, value: boolean): void
}

export const AppConfigStoreSymbol = Symbol.for('IAppConfigStore')

@injectable()
export class AppConfigStore implements IAppConfigStore {
  @inject(PersistanceSymbol) persistance: {
    transactionAvailabilityInfoUpdatedAt?: string | null
    transactionAvailabilityInfo?: TransactionAvailabilityInfo | null
    onboarding?: boolean
    isOnboardingSeen?: Record<OnboardingType, boolean | undefined>
  }

  @observable config: AppConfig = {
    buyDummyDelay: 3000,
    sellDummyDelay: 3000,
  }

  @observable transactionAvailabilityInfo: TransactionAvailabilityInfo = DefaultTransactionAvailabilityInfo
  @observable transactionAvailabilityInfoUpdatedAt: Date | null = null

  @observable onboarded = false
  @observable isAppUpdateSkipped = false

  @computed get isOnboardingSeen() {
    return this.persistance.isOnboardingSeen
  }

  @computed get minSupportedAppVersion() {
    return this.remoteConfig[RemoteConfig.MinSupportedAppVersion] as string
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action
  initialize() {
    this.transactionAvailabilityInfoUpdatedAt = this.persistance.transactionAvailabilityInfoUpdatedAt
      ? parseISO(this.persistance.transactionAvailabilityInfoUpdatedAt)
      : null
    this.transactionAvailabilityInfo = this.persistance.transactionAvailabilityInfo
      ? read(this.persistance.transactionAvailabilityInfo, TransactionAvailabilityInfo)
      : DefaultTransactionAvailabilityInfo
    this.onboarded = false //this.persistance.onboarding ?? false

    observe(this, () => {
      this.persistance.transactionAvailabilityInfoUpdatedAt = this.transactionAvailabilityInfoUpdatedAt
        ? formatISO(this.transactionAvailabilityInfoUpdatedAt)
        : null
      this.persistance.transactionAvailabilityInfo = this.transactionAvailabilityInfo
      this.persistance.onboarding = this.onboarded
    })
  }

  @action setOnboarding(state: boolean = true): void {
    this.onboarded = state
  }

  @action set(value: AppConfig): void {
    this.config = value
  }

  @action setTransactionAvailabilityInfo(value: TransactionAvailabilityInfo, updatedAt: Date): void {
    this.transactionAvailabilityInfo = value
    this.transactionAvailabilityInfoUpdatedAt = updatedAt
  }

  @action setIsAppUpdateSkipped(value: boolean): void {
    this.isAppUpdateSkipped = value
  }

  @observable currentRootView: RootViewName | null

  @action setCurrentRootView(value: RootViewName | null): void {
    this.currentRootView = value
  }

  @observable remoteConfig: Record<RemoteConfig, string | number | boolean>

  @action mergeRemoteConfig(value: Record<RemoteConfig, string | number | boolean>): void {
    this.remoteConfig = { ...this.remoteConfig, ...value }
  }

  @action setOnboardingSeen(type: OnboardingType, value: boolean): void {
    this.persistance.isOnboardingSeen = { ...this.persistance.isOnboardingSeen, [type]: value }
  }
}

const DefaultTransactionAvailabilityInfo = new TransactionAvailabilityInfo()
DefaultTransactionAvailabilityInfo.after = '05:00:00 PM +0100'
DefaultTransactionAvailabilityInfo.showAt = '04:00:00 PM +0100'
DefaultTransactionAvailabilityInfo.showHours = 11

type RootViewName = 'Auth' | 'Main' | 'Blocked'
