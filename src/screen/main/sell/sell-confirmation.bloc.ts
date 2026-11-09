import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { addMinutes } from 'date-fns'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { OneTimeAction } from '../../../services/pin.service'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'

import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'

import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../services/store/current-order.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ConnectionError } from '@ts-awesome/request'
import { NewSellOrder } from '../../../models/new-sell-order'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { IOrdersStore, OrdersStoreSymbol } from '../../../services/store/orders.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { ScreenMode } from '../../../models'

type BankTransferParams = { uid: string }

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, () => ({ mode: ScreenMode.Sell }))
@breadcrumb('Sell Confirmation')
@injectable()
export class SellConfirmationBLoC implements IBLoC<unknown, BankTransferParams> {
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

  @inject(AppMonitoringServiceSymbol) @named('SellConfirmation') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore

  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow
  @inject(NavigationParamsSymbol) @observable navParams!: BankTransferParams

  @observable unsavedChanges = true
  @observable loading = false
  @observable showBottomSheet = false
  @observable amountCurrency = CurrencyCode.USD

  @computed get data() {
    return this.ordersStore.getPurchaseOrder(this.navParams.uid)!
  }

  @computed get calculatedOrder() {
    return this.currentOrderStore.currentCalculatedOrder!
  }

  @computed get sellStartedAt() {
    return this.currentOrderStore.sellOrderStartAt!
  }

  @computed get sellEndTS() {
    return addMinutes(this.sellStartedAt, 15)
  }

  @computed get total() {
    return this.calculatedOrder.total
  }

  @computed get orderNumber() {
    return this.data?.order.referenceNumber ?? ''
  }

  @computed get selectedBankAccount() {
    const uid = this.currentOrderStore.selectedBankAccount!

    return this.userStore.userBanks.find(x => x.uid === uid)!
  }

  @computed get selectedBankAccountHolder() {
    const { userDetails } = this.userStore.me

    this.monitoring.assert(userDetails?.fullName, 'Unexpected: user full name must be set')

    return userDetails.fullName
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onCancel() {
    this.showBottomSheet = !this.showBottomSheet
  }

  @action onConfirmCancel() {
    this.unsavedChanges = false
    this.showBottomSheet = !this.showBottomSheet
    this.navigationService.reset(['MainTabs'], [undefined])
  }

  @flow *onSubmit() {
    this.loading = true

    try {
      const sellOrderInput: NewSellOrder = {
        includeFees: this.calculatedOrder.includeFees,
        amount: this.calculatedOrder.amount,
        amountUsdc: this.calculatedOrder.amountUsdc,
        exchangeRate: this.calculatedOrder.exchangeRate,
        feeTotal: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        totalUsdc: this.calculatedOrder.amountUsdc,
        userBankAccount: this.currentOrderStore.selectedBankAccount,
      }

      const result = yield this.oneTimeActionFlow.auto(OneTimeAction.CreateSellOrder, () =>
        this.orderService.addSellOrder(sellOrderInput),
      )
      if (!result.fulfilled) {
        return
      }

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, {
        mode: ScreenMode.Sell,
        status: 'success',
        amount: this.calculatedOrder.amount,
        neobankFee: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        exchangeRate: this.calculatedOrder.exchangeRate,
        providerFee: 0,
      })

      const order = result.result
      const activity = this.activityStore.getByOrder(order)
      this.unsavedChanges = false

      this.navigationService.reset(['MainTabs', 'SellOrderStatus'], [undefined, { uid: activity.uid }])
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, {
        mode: ScreenMode.Sell,
        status: 'failure',
        amount: this.calculatedOrder.amount,
        neobankFee: this.calculatedOrder.feeTotal,
        total: this.calculatedOrder.total,
        exchangeRate: this.calculatedOrder.exchangeRate,
        providerFee: 0,
      })

      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else {
        this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    } finally {
      this.loading = false
    }
  }

  @action onRequestClose(): boolean {
    if (this.unsavedChanges) {
      this.onCancel()

      return false
    } else {
      return true
    }
  }
}
