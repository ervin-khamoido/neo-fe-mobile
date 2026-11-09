import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { AuthNavigatorDef, MainNavigatorDef, MainTabsNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { IWalletStore, WalletStoreSymbol } from '../../../services/store/wallet.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { FinanceServiceSymbol, IFinanceService } from '../../../services/finance.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { cleanable, ICleanable } from '../../../utils/sanitizer'
import { ConnectionError } from '@ts-awesome/request'
import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'
import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'
import { OneTimeAction } from '../../../services/pin.service'
import { ScreenMode } from '../../../models'
import { AuthStoreSymbol, IAuthStore } from '../../../services/store/auth.store'
import { ILevelService, LevelServiceSymbol } from '../../../services/level/level.service'
import { ILockService, LockServiceSymbol } from '../../../services/lock.service'

@cleanable
@breadcrumb('Delete Neobank Account')
@injectable()
export class DeleteAccountBLoC implements IBLoC, ICleanable {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(NavigationServiceSymbol) authNavigationService!: INavigationService<AuthNavigatorDef>
  @inject(NavigationServiceSymbol) tabNavigationService!: INavigationService<MainTabsNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(AppMonitoringServiceSymbol) @named('DeleteAccount') monitoring!: IMonitoringService

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(FinanceServiceSymbol) financeService!: IFinanceService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(LockServiceSymbol) lockService!: ILockService

  @inject(OneTimeActionFlowSymbol) oneTimeAction!: IOneTimeActionFlow

  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(AuthContextSymbol) authContext!: IAuthContext
  @inject(AuthStoreSymbol) authStore!: IAuthStore

  @observable showConfirmDeleteAccountModal: boolean = false
  @observable showDeleteValidateErrorModal: boolean = false
  @observable loading: boolean = false

  @observable deleteValidateErrorCTAs: string[] = []
  @observable deleteValidateErrorBtn: {
    title: string
    onPress: () => void
  } | null = null

  @computed get balance() {
    const { balance } = this.walletStore.balance
    return balance
  }

  constructor() {
    makeObservable(this)
    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.userStore.resetDeleteValidateResult()
  }

  onParamsChange() {
    // nothing to do here
  }

  onCancel() {
    this.navigationService.back()
  }

  @flow *onDeleteAccount() {
    this.loading = true
    yield this.userService.validateDeleteUserAccount()

    const { valid, errors = [] } = this.userStore.deleteValidateResult
    if (valid) {
      this.showConfirmDeleteAccountModal = true
    } else {
      const knownErrors = ['remaining_balance', 'remaining_locks', 'remaining_balance_card', 'open_orders']
      const errorCodes = errors.map(x => x.code)

      this.monitoring.assert(
        errorCodes.every(x => knownErrors.includes(x)), // only known errors
        'Expected only known error codes',
      )

      this.deleteValidateErrorCTAs = errorCodes.map(x => ErrorCodeMessage[x])
      this.deleteValidateErrorBtn = this.getDeleteValidateErrorBtn(errorCodes)

      this.showDeleteValidateErrorModal = true
    }

    this.loading = false
  }

  getDeleteValidateErrorBtn(errorCodes: string[]) {
    if (errorCodes.includes('open_orders')) {
      return {
        title: 'Activity',
        onPress: () => this.onActivity(),
      }
    }

    if (errorCodes.includes('remaining_balance')) {
      return {
        title: 'Withdraw',
        onPress: () => this.onSell(),
      }
    }

    if (errorCodes.includes('remaining_locks')) {
      return {
        title: 'Go to Locks',
        onPress: () => this.onLocks(),
      }
    }

    if (errorCodes.includes('remaining_balance_card')) {
      return {
        title: 'To Card',
        onPress: () => this.onCard(),
      }
    }
  }

  onActivity() {
    this.showDeleteValidateErrorModal = false
    this.navigationService.navigate('Activity')
  }

  @action onCancelDeleteValidateErrorModal() {
    this.showDeleteValidateErrorModal = false
  }

  onCard() {
    this.tabNavigationService.navigate('Card')
  }

  @flow *onLocks() {
    this.loading = true

    try {
      yield this.lockService.syncLocks()
      this.navigationService.navigate('Lock')
    } catch (err) {
      this.toastService.error('Oops... Something went wrong, please try again.')
    } finally {
      this.loading = false
      this.showDeleteValidateErrorModal = false
    }
  }

  @flow *onSell() {
    this.loading = true
    try {
      yield Promise.all([
        this.financeService.syncExchangeRates(),
        this.levelService.syncCurrentLimits(),
        this.levelService.syncTransactionLimits(),
        //
      ])

      this.navigationService.reset(['MainTabs', 'Amount'], [undefined, { mode: ScreenMode.Sell }])
      this.showDeleteValidateErrorModal = false
    } catch (err) {
      this.monitoring.exception(err)
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.loading = false
    }
  }

  @action onConfirmDeleteAccountToggle() {
    this.showConfirmDeleteAccountModal = !this.showConfirmDeleteAccountModal
  }

  @flow *onConfirmDeleteAccount() {
    this.loading = true

    /*
    `showConfirmDeleteAccountModal` primarily controls visibility of `ConfirmDeleteAccountModal` modal. When user confirms deletion of account, modal should close immediately in event that appLock requires pin code to prevent obstruction.

    Coincidentally, member variable `loading` is affixed to `Delete Neobank Account` btn which will control when `this.oneTimeAction.auto` resolves.

    Fully tested on iOS & Android
    */
    this.showConfirmDeleteAccountModal = false
    try {
      const result = yield this.oneTimeAction.auto(
        OneTimeAction.DeleteNEOBANKAccount,
        () => this.userService.sendDeleteUserAccount(),
        //
      )

      if (!result.fulfilled) {
        return
      }
      this.authContext.signOut()
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else {
        this.monitoring.exception(err)
        const error = Array.isArray(err) ? (err.length > 0 ? err[0] : 'Something went wrong') : err.message
        this.toastService.error(error)
      }
    } finally {
      this.loading = false
    }
  }

  @action clean() {
    this.userStore.resetDeleteValidateResult()
  }
}

const ErrorCodeMessage = Object.freeze({
  ['remaining_balance']: 'Please withdraw all your USDC funds from Neobank App wallet',
  ['remaining_balance_card']: 'Please withdraw all your USDC funds from Neobank App virtual card',
  ['remaining_locks']:
    'You currently have some amount of money locked. Please withdraw all locked funds before you can proceed with account deletion',
  ['open_orders']: 'Please close all your opened orders',
})
