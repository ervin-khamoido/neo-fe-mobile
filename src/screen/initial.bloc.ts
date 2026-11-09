import { inject, injectable, named } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../ioc'
import { breadcrumb } from '../utils/breadcrumb'

import { IToastService, ToastServiceSymbol } from '../services/toast.service'
import { ApiServiceSymbol, IApiService } from '../services/api.service'

import { AuthContextSymbol } from '../services/context/auth'
import { IAuthContext } from '../services/context/auth/interfaces'

import { AuthRequest, AuthStateModal, AuthStoreSymbol, IAuthStore } from '../services/store/auth.store'
import { DeviceStoreSymbol, IDeviceStore } from '../services/store/device.store'
import { AppConfigStoreSymbol, IAppConfigStore } from '../services/store/app-config.store'
import { BuildInfoNativeModuleSymbol, IBuildInfoNativeModule } from '../services/native-module/build-info.nm'
import { isVersionSupported } from '../utils/helpers'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../services/monitoring.service'
import { IUserStore, UserStoreSymbol } from '../services/store/user.store'
import { INavigationService, NavigationServiceSymbol } from '../services/navigation.service'
import { MainNavigatorDef } from './common'

@breadcrumb('Initial')
@injectable()
export class InitialBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('InitialBLoC') monitoring!: IMonitoringService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(AuthContextSymbol) authContext!: IAuthContext
  @inject(BuildInfoNativeModuleSymbol) buildInfoNM!: IBuildInfoNativeModule

  @observable private info: Record<string, string | number | boolean> = {}

  @computed get isAuthFailure() {
    return this.authStore.modals[AuthStateModal.AuthFailure]
  }

  @computed get singInPending() {
    const signInRequest = this.authStore.requests[AuthRequest.SignIn]
    const mainSetupRequest = this.authStore.requests[AuthRequest.MainSetup]

    return signInRequest.pending || mainSetupRequest.pending
  }

  @computed get appIsConnectedToInternet() {
    return this.deviceStore.appIsConnectedToInternet
  }

  @computed get currentRootView() {
    return this.appConfigStore.currentRootView
  }

  @computed get currentAppVersion() {
    return this.deviceStore.buildInfo.VERSION_NAME as string
  }

  @computed get currentVersionIsSupported() {
    const { minSupportedAppVersion } = this.appConfigStore

    // if the current version can not be defined then it is supported
    if (!this.currentAppVersion) {
      return true
    }

    try {
      return isVersionSupported(this.currentAppVersion, minSupportedAppVersion)
    } catch (err) {
      this.monitoring.exception(err)
      return false
    }
  }

  @computed get isAppUpdateSkipped() {
    return this.appConfigStore.isAppUpdateSkipped
  }

  @computed get showUpdateAlert() {
    return !this.isAppUpdateSkipped && !this.currentVersionIsSupported
  }

  @computed get isAppLockEnabled() {
    return !!this.userStore.settings?.enableAppLock
  }

  @computed get user() {
    return !!this.userStore.me
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.authContext.appInitialized()
  }

  @flow *onSignInRetry() {
    this.authContext.retrySignIn()
  }

  onParamsChange() {
    // nothing to do here
  }
}
