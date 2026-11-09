import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { PIN_CODE_SIZE } from '../../../common/constrants'
import { IPINService, PINServiceSymbol } from '../../../services/pin.service'
import { IPINStore, PINStoreSymbol } from '../../../services/store/pin.store'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { UserStatus } from '../../../models/user-settings'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ConnectionError } from '@ts-awesome/request'
import { HapticServiceSymbol, IHapticService } from '../../../services/haptic.service'

@injectable()
export class PinBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(AppMonitoringServiceSymbol) @named('Pin') monitoring!: IMonitoringService
  @inject(HapticServiceSymbol) haptic!: IHapticService

  @inject(PINStoreSymbol) pinStore!: IPINStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @observable loading = true

  @observable error = ''
  @observable code = ''

  @computed get requestPIN() {
    return this.pinStore.requestPIN
  }

  @observable resetPinLoading = false
  @observable showResetPin = false
  @observable showResetPinSent = false

  @computed get enableOnlyReset() {
    return this.userStore.userStatus === UserStatus.PinResetRequired
  }

  @computed get userEmail() {
    return this.userStore.me?.email ?? ''
  }

  @computed get biometricEnabled() {
    return this.pinStore.biometricEnabled
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    reaction(
      () => this.requestPIN,
      value => this.handleRequestPin(value),
    )

    yield this.handleRequestPin(this.requestPIN)
  }

  @flow *handleRequestPin(requestPin: boolean) {
    if (!requestPin) {
      return
    }

    try {
      yield this.pinService.tryBiometricSignInWithPIN()
    } catch (ignore) {
      // console.log(ignore.message)
      // console.log(ignore.code)
      // console.log(ignore.domain)
      // console.log(ignore.userInfo)
      //
      // if failed or switched off we expect user to enter the pin code
    } finally {
      this.loading = false
    }
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onForgotPIN() {
    this.showResetPin = true
  }

  @action onResetCancel() {
    this.showResetPin = false
  }

  @flow *onResetConfirm() {
    this.resetPinLoading = true

    try {
      yield this.pinService.forgotPIN()
      yield this.userService.syncUserStatus()

      this.showResetPin = false
      this.showResetPinSent = true
    } catch (err) {
      this.toast.error(err?.message ?? 'Something went wrong')
    } finally {
      this.resetPinLoading = false
    }
  }

  @action onResetSuccessClose() {
    this.showResetPinSent = false
  }

  @flow *onDigitInput<T>(value: T) {
    this.haptic.tapNumpad()

    if (typeof value === 'string' && value === 'biometric') {
      return yield this.handleRequestPin(true)
    }

    this.error = ''
    this.code = `${this.code}${value}`

    if (this.code.length === PIN_CODE_SIZE) {
      return yield this.submitPIN()
    }
  }

  @action onDigitRemove() {
    this.haptic.tapNumpad()
    this.error = ''
    if (this.code.length === 0) {
      return
    }

    this.code = this.code.slice(0, -1)
  }

  @flow *submitPIN() {
    this.loading = true

    try {
      yield this.pinService.signInWithPIN(this.code)
    } catch (err) {
      this.haptic.invalidInput()

      if (err instanceof ConnectionError) {
        this.error = 'Services Temporarily\nUnavailable'
      } else {
        this.error = err.message
      }
    } finally {
      this.code = ''
      this.loading = false

      yield this.userService.syncUserStatus()
    }
  }
}
