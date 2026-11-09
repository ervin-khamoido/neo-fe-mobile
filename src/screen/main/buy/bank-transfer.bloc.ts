import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import Clipboard from '@react-native-clipboard/clipboard'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { displayCurrency, formatCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'
import { differenceInSeconds } from 'date-fns'
import { IOrdersStore, OrdersStoreSymbol } from '../../../services/store/orders.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import {
  CampaignTrackingServiceSymbol,
  ICampaignTrackingService,
} from '../../../services/analytics/campaign-analytics.service'
import { DeviceServiceSymbol, IDeviceService } from '../../../services/device.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { ScreenMode } from '../../../models'

type BankTransferParams = { uid: string }

const REQUIRE_SLOW_DOWN_WITHIN = 30 // seconds

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, () => ({ mode: ScreenMode.Buy }))
@breadcrumb('Bank Transfer')
@injectable()
export class BankTransferBLoC implements IBLoC<unknown, BankTransferParams> {
  get srcCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.NGN].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.USD].symbol
  }

  @inject(NavigationParamsSymbol) @observable navParams!: BankTransferParams

  @inject(AppMonitoringServiceSymbol) @named('BankTransfer') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(DeviceServiceSymbol) deviceService!: IDeviceService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore
  @inject(CampaignTrackingServiceSymbol) campaignTrackingService!: ICampaignTrackingService

  @observable loading = false
  @observable showBottomSheet = false
  @observable showSlowDownModal = false
  @observable showOutsideTimeLimitModal = false

  @observable isAtLeastOneFieldCopied = false
  @observable isAtLeastOnceSlowDownShown = false

  @computed get data() {
    return this.ordersStore.getPurchaseOrder(this.navParams.uid)!
  }

  @computed get disabled() {
    return this.loading
  }

  @computed get buyEndTS() {
    return this.data?.expiresAt
  }

  @computed get buyCreatedAt() {
    return this.data?.createdAt
  }

  @computed get total() {
    return this.data?.total
  }

  @computed get formattedTotal() {
    return formatCurrency(this.data?.total ?? 0, CurrencyCode.NGN, false)
  }

  @computed get displayedTotal() {
    return displayCurrency(this.total).format()
  }

  // Place holders for info from api/store
  @computed get sellerBankName() {
    return this.data?.liquidityProviderBankAccount.bankName
  }

  @computed get sellerBankAccountName() {
    return this.data?.liquidityProviderBankAccount.bankAccountName
  }

  @computed get sellerBankAccountNumber() {
    return this.data?.liquidityProviderBankAccount.bankAccountNumber
  }

  @computed get orderNumber() {
    return this.data?.order.referenceNumber
  }

  @computed get hasTimerExpired() {
    return this.buyEndTS.getTime() - new Date().getTime() < 0
  }

  @computed get isSlowDownRequired() {
    const withinTimeInterval = differenceInSeconds(new Date(), this.buyCreatedAt) <= REQUIRE_SLOW_DOWN_WITHIN

    return (withinTimeInterval || !this.isAtLeastOneFieldCopied) && !this.isAtLeastOnceSlowDownShown
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.monitoring.assert(this.data, `Unexpected: Purchase order with a such ${this.navParams.uid} is not found`)
  }

  @action onParamsChange(_, params: BankTransferParams) {
    this.navParams = params
  }

  @action onCopyInClipboard(field: PaymentDataType) {
    Clipboard.setString(`${this[field]}`)
    this.toastService.info('Copied to clipboard')

    this.isAtLeastOneFieldCopied = true
  }

  @action onCancel() {
    this.showBottomSheet = !this.showBottomSheet
  }
  @action onSlowDownModalClose() {
    this.showSlowDownModal = false
  }

  @action onTimeOut() {
    this.showSlowDownModal = false
  }

  @flow *onConfirmCancel() {
    this.loading = true

    const {
      order: { uid },
    } = this.data
    yield this.orderService.cancelPurchaseOrder(uid)

    this.showBottomSheet = !this.showBottomSheet
    this.navigationService.reset(['MainTabs'], [undefined])

    this.loading = false
  }

  async trackPaidButtonTap(currency: string) {
    this.campaignTrackingService.trackBuyInitiated(currency)
  }

  @flow *onPaid() {
    if (this.hasTimerExpired) {
      this.showOutsideTimeLimitModal = true
    } else if (this.isSlowDownRequired) {
      this.showSlowDownModal = true
      this.isAtLeastOnceSlowDownShown = true
    } else {
      yield this.onSubmit()
    }
  }

  @flow *onSubmit() {
    this.showOutsideTimeLimitModal = false
    this.loading = true

    try {
      const order = this.data?.order.uid
      yield this.orderService.confirmPaidPurchaseOrder(order)

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, {
        mode: ScreenMode.Buy,
        amount: this.data.amount,
        neobankFee: this.data.feeTotal,
        providerFee: 0,
        total: this.data.total,
        exchangeRate: this.data.exchangeRate,
        status: 'success',
      })

      yield this.trackPaidButtonTap('NGN')

      if (this.ordersStore.isFirstTransactionMade) {
        yield this.deviceService.provideFeedback()
      }

      this.navigationService.reset(['MainTabs', 'PurchaseOrderDetails'], [undefined, { uid: order }])
      this.loading = false
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Confirmation, {
        mode: ScreenMode.Buy,
        amount: this.data.amount,
        neobankFee: this.data.feeTotal,
        providerFee: 0,
        total: this.data.total,
        exchangeRate: this.data.exchangeRate,
        status: 'failure',
      })

      this.toastService.error('Something went wrong.')
    }
  }
}

type PaymentDataType = keyof Pick<
  BankTransferBLoC,
  'sellerBankName' | 'sellerBankAccountNumber' | 'orderNumber' | 'total' | 'sellerBankAccountName'
>
