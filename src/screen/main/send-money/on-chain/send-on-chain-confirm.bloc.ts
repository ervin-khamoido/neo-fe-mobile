import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { breadcrumb } from '../../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { MainNavigatorDef } from '../../../common'
import { IOnChainStore, OnChainStoreSymbol } from '../../../../services/store/on-chain.store'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'
import { cutMiddleOfString } from '../../../../utils/helpers'
import { OneTimeAction } from '../../../../services/pin.service'
import { IUserStore, UserStoreSymbol } from '../../../../services/store/user.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'
import { SendMode } from '../../../../models'
import { FinanceStoreSymbol, IFinanceStore } from '../../../../services/store/finance.store'
import currency from 'currency.js'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Confirm, () => ({ mode: SendMode.OnChain }))
@breadcrumb('Send OnChain Confirm')
@injectable()
export class SendOnChainConfirmBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('SendOnChainConfirm') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(OnChainStoreSymbol) onChainStore!: IOnChainStore
  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore

  @observable loading = false
  @observable showConfirmationModal = false
  @observable toggleCheckBox = false

  @computed get currentOrder() {
    return this.onChainStore.currentOnChainOrder
  }

  @computed get amountUsdc() {
    return this.currentOrder?.amountUsdc ?? 0
  }

  @computed get displayAmount() {
    return formatCurrency(this.amountUsdc, CurrencyCode.USD, false)
  }

  @computed get displayAmountWithoutCurrency() {
    return formatCurrency(this.amountUsdc, undefined, false)
  }

  @computed get exchangeRate() {
    return this.currentOrder?.exchangeRate ?? 0
  }

  @computed get nairaExchangeRate() {
    const { sellExchangeRate } = this.financeStore

    return sellExchangeRate
  }

  @computed get displayNairaExchangeRate() {
    const convertedAmount = currency(this.amountUsdc).multiply(this.nairaExchangeRate)

    return `${formatCurrency(this.amountUsdc, CurrencyCode.USD, false)} = ${formatCurrency(
      convertedAmount.value,
      CurrencyCode.NGN,
      false,
    )}`
  }

  @computed get displayExchangeRate() {
    return `${formatCurrency(1, CurrencyCode.USD, false)} = ${formatCurrency(
      this.exchangeRate,
      CurrencyCode.NGN,
      false,
    )}`
  }

  @computed get toAddress() {
    return this.currentOrder?.toAddress ?? ''
  }

  @computed get formattedToAddress() {
    return cutMiddleOfString(this.toAddress)
  }

  @computed get coin() {
    return this.currentOrder?.coin ?? ''
  }

  @computed get baseCoin() {
    return this.currentOrder?.baseCoin
  }

  @computed get displayNeobankFeesUsdc() {
    const { neobankFeeUsdc } = this.currentOrder?.fees ?? {}

    return formatCurrency(neobankFeeUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get displayNetworkFeesUsdc() {
    const { networkFeeUsdc } = this.currentOrder?.fees ?? {}

    return formatCurrency(networkFeeUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get displayTotalUsdc() {
    const totalUsdc = this.currentOrder?.totalUsdc ?? 0

    return formatCurrency(totalUsdc, CurrencyCode.USD, false)
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange() {}

  @action onCancelModal() {
    this.showConfirmationModal = false
    this.toggleCheckBox = false
  }

  @action onToggleCheckBoxOne() {
    this.toggleCheckBox = !this.toggleCheckBox
  }

  @action onOnChainTransfer() {
    this.showConfirmationModal = true
  }

  @flow *onConfirmModal() {
    this.showConfirmationModal = false

    const { settings } = this.userStore

    if (settings?.enableAppLock) {
      yield this.navigationService.wizard('RequestOneTimeAction', { action: OneTimeAction.CreateOnChainOrder })
    } else {
      this.monitoring.exception('Unexpected: the user tried to send without PIN enabled')
    }

    this.navigationService.reset(['MainTabs', 'SendOnChainResult'], [])
  }

  onEdit() {
    this.navigationService.back()
  }
}
