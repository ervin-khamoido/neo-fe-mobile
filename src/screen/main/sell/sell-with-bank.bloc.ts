import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { BankAccountWidgetMode, MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { BankAccount, ScreenMode } from '../../../models'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { displayCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../services/store/current-order.store'
import { WizardCloseError } from '../../../models/error/wizard-close.error'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_WithBank, () => ({ mode: ScreenMode.Sell }))
@breadcrumb('Sell With Bank')
@injectable()
export class SellWithBankBLoC implements IBLoC {
  // currently constant
  readonly destCurrency: CurrencyCode = CurrencyCode.NGN // we sell USDC
  readonly srcCurrency: CurrencyCode = CurrencyCode.USD // we get Naira
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }
  ///

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(UserServiceSymbol) userService!: IUserService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @observable loadingBankAccount: string | null = null
  @observable addBankLoading = false

  @computed get loading() {
    return !!this.loadingBankAccount
  }

  @computed get banks() {
    return this.userStore.userBanks
  }

  @computed get calculatedOrder() {
    return this.currentOrderStore.currentCalculatedOrder!
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onAddBankAccount() {
    this.addBankLoading = true
    const { total } = this.calculatedOrder

    const cta = `Sell ${this.destCurrencySymbol} ${displayCurrency(total).format()}`

    try {
      yield this.userService.syncBanks()
      const uid = yield this.navigationService.wizard('AddBankAccount2', { mode: BankAccountWidgetMode.Sell, cta })
      const bankAccount = this.banks.find(x => x.uid === uid)!

      this.handleBankButton(bankAccount)
    } catch (err) {
      if (err instanceof WizardCloseError) {
        // ignore
      } else {
        this.toast.error(err.message)
      }
    } finally {
      this.addBankLoading = false
    }
  }

  @flow *handleBankButton(bankAccount: BankAccount) {
    this.loadingBankAccount = bankAccount.uid

    this.currentOrderStore.selectCurrentBankAccount(bankAccount.uid)

    this.navigationService.reset(['MainTabs', 'SellConfirmation'], [undefined, undefined])
    this.loadingBankAccount = null
  }
}
