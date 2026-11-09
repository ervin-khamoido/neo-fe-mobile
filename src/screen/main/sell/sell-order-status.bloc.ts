import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { IActivityTimelineStatus } from '../tabs/components/activity-timeline'
import { displayCurrency } from '../../../lib/utils/helpers'
import { Activity, ActivityStatusEnum, ISellOrderDetails, ScreenMode, SellOrderActivityStatus } from '../../../models'
import { IReactionDisposer } from 'mobx/dist/core/reaction'
import { getScreenForActivity } from '../common'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import { RemoteConfig } from '../../../services/remote-config.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'

type SellOrderStatusParams = { uid: string }

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_OrderDetails, () => ({ mode: ScreenMode.Sell }))
@breadcrumb('Sell Order Status')
@injectable()
export class SellOrderStatusBLoC implements IBLoC<unknown, SellOrderStatusParams> {
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC

  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @inject(AppMonitoringServiceSymbol) @named('SellOrderStatus') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @inject(NavigationParamsSymbol) @observable navParams!: SellOrderStatusParams

  @observable showReceivedModal = false
  @observable confirmCheckbox = false

  @observable loading = false

  private activityDisposer: IReactionDisposer | null = null

  @computed get activity() {
    const { uid } = this.navParams

    return this.activityStore.getOne(uid)
  }

  @computed get statuses(): IActivityTimelineStatus[] {
    const pendingStatuses = this.activityStore.soStatusDefinitions.filter(x => !x.isClosed && x.isVisible)

    return pendingStatuses.map(s => {
      return {
        name: s.name,
        completed: !!this.activity.statuses.find(st => st.status === s.status),
      }
    })
  }

  @computed get showHolidayBanner() {
    const { remoteConfig } = this.appConfigStore

    return remoteConfig[RemoteConfig.ShowHolidayBanner]
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityDisposer = reaction(
      () => this.activity,
      value => this.onActivityUpdate(value),
    )
  }

  onActivityUpdate(value: Activity) {
    const handleStates: ActivityStatusEnum[] = this.activityStore.soStatusDefinitions
      .filter(x => x.isClosed)
      .map(x => x.status)

    if (!value || !handleStates.includes(value.status)) {
      return
    }

    // is handled manually
    if (value.status === SellOrderActivityStatus.Completed) {
      return
    }

    this.activityDisposer?.()
    this.activityDisposer = null

    const screen = getScreenForActivity(value)
    this.navigationService.replace(screen, { uid: value.uid, headerShown: false })
  }

  onDisplayValue(item: number | string) {
    return displayCurrency(item).format()
  }

  async onSupport() {
    this.navigationService.navigate('EmailSupport')
  }

  @action onParamsChange(_, params: SellOrderStatusParams) {
    this.navParams = params
  }

  @action onToggleReceivedModal() {
    this.showReceivedModal = !this.showReceivedModal
  }

  @flow *onConfirmReceivedModal() {
    this.loading = true

    const amount = (this.activity.details as ISellOrderDetails).amount
    const neobankFee = (this.activity.details as ISellOrderDetails).fee
    const exchangeRate = (this.activity.details as ISellOrderDetails).exchangeRate
    const total = this.activity.amount

    try {
      yield this.orderService.confirmSellOrder(this.activity.order)

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_OrderDetails, {
        mode: ScreenMode.Sell,
        status: 'success',
        amount: amount,
        neobankFee: neobankFee,
        total: total,
        exchangeRate: exchangeRate,
        providerFee: 0,
      })
    } catch (err) {
      this.toast.error('Something went wrong.')

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_OrderDetails, {
        mode: ScreenMode.Sell,
        status: 'failure',
        amount: amount,
        neobankFee: neobankFee,
        total: total,
        exchangeRate: exchangeRate,
        providerFee: 0,
      })
    }

    this.navigationService.replace('TransactionsDetails', { uid: this.activity.uid })

    this.loading = false
  }

  @action onToggleConfirmCheckbox() {
    this.confirmCheckbox = !this.confirmCheckbox
  }

  onBackToWallet() {
    this.navigationService.reset(['MainTabs'], [undefined])
  }

  @action onDestroy() {
    if (this.activityDisposer) {
      this.activityDisposer()
      this.activityDisposer = null
    }
  }
}
