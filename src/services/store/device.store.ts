import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'
import { AppStateStatus } from 'react-native'

export interface IDeviceStore {
  readonly biometricAvailable: boolean
  readonly appState: AppStateStatus
  readonly appIsConnectedToInternet: boolean
  readonly buildInfo: Record<string, string | number | boolean>
  readonly splashShown: boolean

  setBiometricAvailable(value: boolean): void
  setAppState(value: AppStateStatus): void
  setAppIsConnectedToInternet(value: boolean): void
  setBuildInfo(data: Record<string, string | number | boolean>): void
  setSplashShown(value: boolean): void
}

export const DeviceStoreSymbol = Symbol.for('IDeviceStore')

@injectable()
export class DeviceStore implements IDeviceStore {
  @observable biometricAvailable = false
  @observable appState: AppStateStatus = 'active'
  @observable appIsConnectedToInternet: boolean = true
  @observable buildInfo: Record<string, string | number | boolean> = {}
  @observable splashShown: boolean = true

  constructor() {
    makeObservable(this)
  }

  @action setBiometricAvailable(value: boolean): void {
    this.biometricAvailable = value
  }

  @action setAppState(value: AppStateStatus): void {
    this.appState = value
  }

  @action setAppIsConnectedToInternet(value: boolean) {
    this.appIsConnectedToInternet = value
  }

  @action setBuildInfo(data: Record<string, string | number | boolean>): void {
    this.buildInfo = data
  }

  @action setSplashShown(value: boolean): void {
    this.splashShown = value
  }
}
