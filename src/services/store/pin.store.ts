import { inject, injectable, named } from 'inversify'
import { action, makeObservable, observable, observe, reaction } from 'mobx'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { PersistanceSymbol } from '../../lib/utils/persistance'

export interface IPINStore {
  readonly requestPIN: boolean
  readonly token: string | null
  readonly oneTimeToken: string | null
  readonly biometricEnabled: boolean

  readonly refreshing: boolean

  setToken(token: string | null): void
  setOneTimeToken(token: string | null): void
  setRequestPIN(show: boolean): void
  setRefreshing(value: boolean): void
  setBiometricEnabled(value: boolean): void
}

export const PINStoreSymbol = Symbol.for('IPINStore')

@cleanable
@injectable()
export class PINStore implements IPINStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('PinStore') monitoring!: IMonitoringService

  @inject(PersistanceSymbol) persistance!: { biometricEnabled?: boolean }

  @observable requestPIN = false
  @observable token: string | null
  @observable oneTimeToken: string | null
  @observable biometricEnabled = false

  @observable refreshing = false

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    const { biometricEnabled } = this.persistance

    this.biometricEnabled = typeof biometricEnabled === 'boolean' ? biometricEnabled : false

    observe(this, () => {
      this.persistance.biometricEnabled = this.biometricEnabled
    })
  }

  @action setToken(token: string | null): void {
    this.token = token
  }

  @action setRequestPIN(show: boolean): void {
    this.requestPIN = show
  }

  @action setOneTimeToken(token: string | null): void {
    this.oneTimeToken = token
    this.monitoring.breadcrumb('One Time Token Obtained')
  }

  @action setRefreshing(value: boolean): void {
    this.refreshing = value
  }

  @action setBiometricEnabled(value: boolean): void {
    this.biometricEnabled = value
  }

  @action clean() {
    this.requestPIN = false
    this.token = null
    this.oneTimeToken = null
    this.refreshing = false
    this.biometricEnabled = false
  }
}
