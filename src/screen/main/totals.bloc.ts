import { inject, injectable, named } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'
import { CurrencyCode, CurrencyInfo, TRANSACTION_AVAILABILITY_SHOW_FORMAT } from '../../common/constrants'

import { ScreenMode } from '../../models'

import { formatCurrency, formatDateInWAT } from '../../lib/utils/helpers'
import { NavigationParamsSymbol } from '../../ioc/component.scope'
import { breadcrumb } from '../../utils/breadcrumb'
import { LevelFlowInterruptError } from '../../models/error/level-flow-interrupt.error'
import { LevelOneRequirement, UserLevel } from '../../models/level/definitions'

import { ApiServiceSymbol, IApiService } from '../../services/api.service'
import { IUserService, UserServiceSymbol } from '../../services/user.service'
import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../services/monitoring.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { ILevelOneService, LevelOneServiceSymbol } from '../../services/level/level-one.service'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'

import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../services/store/current-order.store'
import { ILevelStore, LevelStoreSymbol } from '../../services/store/level.store'

import { ConnectionError } from '@ts-awesome/request'
import { ILevelService, LevelServiceSymbol } from '../../services/level/level.service'
import { screenAnalytics } from '../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../services/analytics/analytics.service'

type NavParams = MainNavigatorDef['Totals']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Totals, (_, params) => ({
  mode: params.mode,
}))
@breadcrumb('Totals')
@injectable()
export class TotalsBLoC implements IBLoC<unknown, NavParams> {
  // currently constant
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @inject(AppMonitoringServiceSymbol) @named('Totals') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  @inject(NavigationParamsSymbol) navParams!: NavParams

  @observable loading = false
  @observable isFeesIncluded = false

  @computed get mode() {
    return this.navParams.mode
  }

  @computed get calculatedOrder() {
    return this.currentOrderStore.currentCalculatedOrder!
  }

  @computed get amount() {
    const { amount } = this.calculatedOrder
    return amount
  }

  @computed get formattedAmount() {
    return formatCurrency(this.amountUsdc, this.destCurrency, false)
  }

  @computed get amountUsdc() {
    const { amountUsdc } = this.calculatedOrder
    return amountUsdc
  }

  @computed get total() {
    const { total } = this.calculatedOrder
    return total
  }

  @computed get formattedTotal() {
    return formatCurrency(this.total, this.srcCurrency, false).toString()
  }

  @computed get exchangeRate() {
    const { exchangeRate } = this.calculatedOrder
    return exchangeRate
  }

  @computed get formattedExchangeRate() {
    return `${formatCurrency(1, this.destCurrency, false)} = ${formatCurrency(
      this.exchangeRate,
      this.srcCurrency,
      false,
    )}`
  }

  @computed get formattedInfoExchangeRate() {
    return `${formatCurrency(this.exchangeRate, this.srcCurrency, false)} / ${formatCurrency(
      1,
      this.destCurrency,
      false,
    )}`
  }

  @computed get showTransactionAvailabilityMessage() {
    return this.appConfigStore.transactionAvailabilityInfo.showMessage()
  }

  @computed get transactionAvailabilityAfter() {
    const { afterDate } = this.appConfigStore.transactionAvailabilityInfo

    return formatDateInWAT(afterDate, TRANSACTION_AVAILABILITY_SHOW_FORMAT)
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.monitoring.assert(this.calculatedOrder, 'Unexpected: calculated order is null')

    yield this.api.syncTransactionAvailabilityInfo()
  }

  onParamsChange() {
    // nothing to do here
  }

  onEdit() {
    this.navigationService.back()
  }

  @flow *onBankTransfer() {
    this.loading = true

    const canProceed = yield this.levelOneFlow()
    if (!canProceed) {
      this.loading = false
      return
    }

    yield Promise.all([
      this.userService.syncBanks(),
      this.userService.syncBankAccounts(),
      //
    ])

    switch (this.mode) {
      case ScreenMode.Buy:
        this.navigationService.navigate('PayWithBank')
        break
      case ScreenMode.Sell:
        // from this moment we give 15m to finish up the order
        this.currentOrderStore.setSellOrderStartAt(new Date())
        this.navigationService.navigate('SellWithBank')
        break
      default:
        this.monitoring.exception(`Unexpected mode ${this.mode}`)
        throw new Error('Something went wrong')
    }

    this.loading = false
  }

  @flow private *levelOneFlow() {
    try {
      yield this.levelService.syncLevelsDetails()
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable')
      }

      return false
    }

    const hasAddedBankAccountAtLeastOnce = !this.levelStore.isRequirementRemaining(
      UserLevel.Level1,
      LevelOneRequirement.BankAccount,
    )

    try {
      const isSkippable = this.mode === ScreenMode.Sell && !!hasAddedBankAccountAtLeastOnce
      yield this.levelOneService.triggerFlow(isSkippable, true)
      yield this.levelOneService.waitCurrentFlow()

      return true
    } catch (err) {
      if (err instanceof LevelFlowInterruptError) {
        // user has interrupted the flow -> analytics?
        switch (this.mode) {
          case ScreenMode.Sell:
            return hasAddedBankAccountAtLeastOnce // user can proceed
          case ScreenMode.Buy:
          default:
            return false // user can't proceed
        }
      } else {
        // something went wrong
        this.toast.error(err.message)
        return false
      }
    }
  }
}
