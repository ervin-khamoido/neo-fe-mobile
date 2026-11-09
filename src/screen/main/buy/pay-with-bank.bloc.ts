import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { BankAccountWidgetMode, MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { BankAccount, ScreenMode } from '../../../models'

import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'
import { breadcrumb } from '../../../utils/breadcrumb'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../services/store/current-order.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { WizardCloseError } from '../../../models/error/wizard-close.error'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import { displayCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import {
  CampaignTrackingServiceSymbol,
  ICampaignTrackingService,
} from '../../../services/analytics/campaign-analytics.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_WithBank, () => ({ mode: ScreenMode.Buy }))
@breadcrumb('Pay With Bank')
@injectable()
export class PayWithBankBLoC implements IBLoC {
  // currently constant
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get Naira
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell USDC
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }
  ///

  @inject(AppMonitoringServiceSymbol) @named('PayWithBank') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(OrderServiceSymbol) orderService!: IOrderService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow

  @inject(CampaignTrackingServiceSymbol) campaignTrackingService!: ICampaignTrackingService

  @observable loadingBankAccount: string | null = null
  @observable addBankLoading = false

  @observable selectedBankAccount: BankAccount | null = null
  @observable showConfirmationModal: boolean = false
  @observable toggleCheckBoxOne: boolean = false
  @observable toggleCheckBoxTwo: boolean = false

  @computed get calculatedOrder() {
    return this.currentOrderStore.currentCalculatedOrder
  }

  @computed get loading() {
    return !!this.loadingBankAccount
  }

  @computed get banks() {
    return this.userStore.userBanks
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.monitoring.assert(this.calculatedOrder, 'Unexpected: calculated order is null')
  }

  onParamsChange() {
    // nothing to do here
  }

  trackAddBankAccount() {
    //this.campaignTrackingService.trackAddBankAccount()
  }

  @flow *onAddBankAccount() {
    this.addBankLoading = true

    const { total } = this.currentOrderStore.currentCalculatedOrder
    const cta = `Pay ${this.srcCurrencySymbol} ${displayCurrency(total).format()}`

    try {
      yield this.userService.syncBanks()
      const uid = yield this.navigationService.wizard('AddBankAccount2', { mode: BankAccountWidgetMode.Sell, cta })
      const bankAccount = this.banks.find(x => x.uid === uid)!
      this.trackAddBankAccount()

      this.onBankAccount(bankAccount)
    } catch (err) {
      if (err instanceof WizardCloseError) {
        // ignore
      } else {
        this.toastService.error(err.message)
      }
    } finally {
      this.addBankLoading = false
    }
  }

  @action onBankAccount(bankAccount: BankAccount) {
    this.selectedBankAccount = bankAccount
    this.showConfirmationModal = true
  }

  @action onCancelModal() {
    this.selectedBankAccount = null
    this.showConfirmationModal = false
    this.toggleCheckBoxOne = false
    this.toggleCheckBoxTwo = false
  }

  @action onToggleCheckBoxOne() {
    this.toggleCheckBoxOne = !this.toggleCheckBoxOne
  }

  @action onToggleCheckBoxTwo() {
    this.toggleCheckBoxTwo = !this.toggleCheckBoxTwo
  }

  @flow *onConfirmModal() {
    this.loadingBankAccount = this.selectedBankAccount.uid

    this.currentOrderStore.selectCurrentBankAccount(this.selectedBankAccount.uid)

    try {
      const uid = yield this.orderService.addPurchaseOrder({
        includeFees: this.calculatedOrder.includeFees,
        amount: this.calculatedOrder.amount,
        exchangeRate: this.calculatedOrder.exchangeRate,
        feeTotal: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        totalUsdc: this.calculatedOrder.amountUsdc,
        userBankAccount: this.currentOrderStore.selectedBankAccount,
      })

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_WithBank, {
        mode: ScreenMode.Buy,
        amount: this.calculatedOrder.amount,
        neobankFee: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        providerFee: 0,
        exchangeRate: this.calculatedOrder.exchangeRate,
        status: 'success',
      })

      this.navigationService.reset(['MainTabs', 'BankTransfer'], [undefined, { uid }])
      this.showConfirmationModal = false

      this.currentOrderStore.clean()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_WithBank, {
        mode: ScreenMode.Buy,
        amount: this.calculatedOrder.amount,
        neobankFee: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        providerFee: 0,
        exchangeRate: this.calculatedOrder.exchangeRate,
        status: 'failure',
      })

      // TODO: check if that is the proper way to handle the error
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.loadingBankAccount = null
    }
  }
}
