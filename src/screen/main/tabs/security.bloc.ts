import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { IPINStore, PINStoreSymbol } from '../../../services/store/pin.store'
import { DeviceStoreSymbol, IDeviceStore } from '../../../services/store/device.store'
import { IPINService, OneTimeAction, PINServiceSymbol } from '../../../services/pin.service'
import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'
import { breadcrumb } from '../../../utils/breadcrumb'

@breadcrumb('Security')
@injectable()
export class SecurityBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(PINServiceSymbol) pinService!: IPINService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PINStoreSymbol) pinStore!: IPINStore
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore

  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow

  @observable checkboxValue: boolean = false
  @observable biometricLoading = false

  @computed get isAppLockEnabled() {
    return !!this.userStore.settings?.enableAppLock
  }

  @computed get isBiometricsAvailable() {
    return this.deviceStore.biometricAvailable
  }

  @computed get isBiometricsEnabled() {
    return this.pinStore.biometricEnabled
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  // @flow *onAppLock(enable: boolean) {
  //   if (enable) {
  //     this.navigationService.navigate('EnableAppLock')
  //   } else {
  //     yield this.oneTimeActionFlow.auto(OneTimeAction.DisableAppLock, () => this.pinService.removePIN())
  //   }
  // }

  @flow *onBiometrics() {
    this.biometricLoading = true
    yield this.pinService.toggleBiometric()

    this.biometricLoading = false
  }

  onSecurePin() {
    this.navigationService.navigate('ChangePIN')
  }
}
