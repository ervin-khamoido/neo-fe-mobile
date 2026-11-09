import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'
import { ConnectionError } from '@ts-awesome/request'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'
import { AMOUNT_LIMIT, CurrencyCode, CurrencyInfo } from '../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { FinanceStoreSymbol, IFinanceStore } from '../../services/store/finance.store'
import { IPreferenceStore, PreferenceStoreSymbol } from '../../services/store/preference.store'

import { displayCurrency, formatCurrency, getFontSizeForAmount } from '../../lib/utils/helpers'
import { Alphabet, AmountFSMSymbol, IAmountFSM } from '../../utils/amount.fsm'
import { NavigationParamsSymbol } from '../../ioc/component.scope'

import { ComputeFeeInput, ScreenMode } from '../../models'
import { IWalletStore, WalletStoreSymbol } from '../../services/store/wallet.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../services/monitoring.service'
import { breadcrumb } from '../../utils/breadcrumb'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'

import { IOrderService, OrderServiceSymbol } from '../../services/order.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { ILevelStore, LevelStoreSymbol } from '../../services/store/level.store'
import { UserLevel } from '../../models/level/definitions'
import { ILevelFlowService, LevelFlowServiceSymbol } from '../../services/level/level-flow.service'
import { FinanceServiceSymbol, IFinanceService } from '../../services/finance.service'
import { ISupportService, SupportServiceSymbol } from '../../services/support/support.service'
import { IVirtualCardStore, VirtualCardStoreSymbol } from '../../services/store/virtual-card.store'
import { exchangeAmount } from '../../utils/amount'
import { screenAnalytics } from '../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../services/analytics/analytics.service'

type NavParams = MainNavigatorDef['Amount']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Amount, (_, params) => ({
  mode: params.mode,
}))
@breadcrumb('Amount')
@injectable()
export class AmountBLoC implements IBLoC<unknown, NavParams> {
  // currently constant
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }
  ///

  @inject(AppMonitoringServiceSymbol) @named('Amount') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(FinanceServiceSymbol) financeService!: IFinanceService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService
  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(PreferenceStoreSymbol) preferenceStore!: IPreferenceStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(FinanceStoreSymbol) exchangeRateStore!: IFinanceStore
  @inject(VirtualCardStoreSymbol) virtualCardStore!: IVirtualCardStore
  @inject(LevelFlowServiceSymbol) levelFlowService: ILevelFlowService

  @inject(AmountFSMSymbol) fsm!: IAmountFSM

  @inject(NavigationParamsSymbol) navParams!: NavParams

  @observable loading = false

  @observable showExceededLimitModal = false
  @observable showExceededLimitWithKYCUpgrade = false

  @observable amountCurrency = CurrencyCode.USD
  @observable currencyToggle = false

  @computed get mode() {
    return this.navParams.mode
  }

  @computed get userBalance() {
    return this.walletStore.balance.balance
  }

  @computed get amount() {
    return this.fsm.value
  }

  @computed get formattedAmount() {
    return formatCurrency(this.amount, this.amountCurrency, false)
  }

  @computed get formattedMaxAmount() {
    return this.formatCurrency(this.maxAmount)
  }

  @computed get formattedAvailableLimitAmount() {
    return this.amountCurrencySymbol + this.formattedMaxAmount
  }

  @computed get amountCurrencySymbol() {
    return CurrencyInfo[this.amountCurrency].symbol
  }

  @computed get amountCurrencyNairaSymbol() {
    return CurrencyInfo.ngn.symbol
  }

  @computed get amountCurrencyTitle() {
    return this.amountCurrency.toUpperCase()
  }

  @computed get convertedAmountCurrency() {
    return this.amountCurrency === this.srcCurrency ? this.destCurrency : this.srcCurrency
  }

  @computed get convertedAmountCurrencySymbol() {
    return CurrencyInfo[this.convertedAmountCurrency].symbol
  }

  @computed get convertedAmount() {
    if (this.amountCurrency === this.srcCurrency) {
      return currency(this.amount).divide(this.exchangeRate).value
    } else if (this.amountCurrency === this.destCurrency) {
      return currency(this.amount).multiply(this.exchangeRate).value
    }
  }

  @computed get exchangeRate() {
    const { buyExchangeRate, sellExchangeRate } = this.financeStore

    switch (this.mode) {
      case ScreenMode.Buy:
        return buyExchangeRate
      case ScreenMode.Sell:
        return sellExchangeRate
    }
  }

  @computed get submitBtnTitle() {
    switch (this.mode) {
      case ScreenMode.Buy:
        return 'Deposit'
      case ScreenMode.Sell:
        return 'Withdraw'
      default:
        return 'Next'
    }
  }

  @computed get exchangeRateWithNairaSymbol() {
    return this.srcCurrencySymbol + this.exchangeRate
  }

  @computed get appConfig() {
    return this.appConfigStore.config
  }

  @computed get maxAmount() {
    const limits = this.levelStore.currentLimits
    const maxLimit = this.mode === ScreenMode.Sell ? limits.SO.maxLimit : limits.PO.maxLimit

    if (this.amountCurrency === this.srcCurrency) {
      return currency(maxLimit).multiply(this.exchangeRate).value
    } else {
      return maxLimit
    }
  }

  @computed get currentLimits() {
    const { currentLimits } = this.levelStore

    switch (this.mode) {
      case ScreenMode.Sell:
        return currentLimits?.SO
      case ScreenMode.Buy:
        return currentLimits?.PO
      default:
        return null
    }
  }

  @computed get numberFontSize() {
    return getFontSizeForAmount(this.amount)
  }

  @computed get displayModalBody() {
    if (!this.currentLimits) {
      return null
    }

    const operation = this.mode === ScreenMode.Buy ? 'deposit' : 'withdraw'

    const { maxLimit } = this.currentLimits
    const maxLimitFormatted = formatCurrency(maxLimit, CurrencyCode.USD, false)

    return `You can only ${operation} up to ${maxLimitFormatted}. Please contact customer support to increase your limit.`
  }

  @computed get displayUpgradeModalBody() {
    if (!this.currentLimits) {
      return null
    }

    const operation = this.mode === ScreenMode.Buy ? 'deposit' : 'withdraw'

    const { maxLimit } = this.currentLimits
    const maxLimitFormatted = formatCurrency(maxLimit, CurrencyCode.USD, false)

    return `You can only ${operation} up to ${maxLimitFormatted}. Please verify your identity to increase your limit.`
  }

  @computed get buyLimitAmounts() {
    let { minBuyAmountUsdc: buyMin, maxBuyAmountUsdc: buyMax } = this.levelStore.transactionLimits

    if (this.amountCurrency !== CurrencyCode.USD) {
      const exchangeRate = this.exchangeRate

      buyMin = exchangeAmount(buyMin, exchangeRate)
      buyMax = exchangeAmount(buyMax, exchangeRate)
    }

    return {
      buyMin,
      buyMax,
    }
  }

  @computed get sellLimitAmounts() {
    let { maxSellAmountUsdc: sellMax, minSellAmountUsdc: sellMin } = this.levelStore.transactionLimits

    if (this.amountCurrency !== CurrencyCode.USD) {
      const exchangeRate = this.exchangeRate

      sellMin = exchangeAmount(sellMin, exchangeRate)
      sellMax = exchangeAmount(sellMax, exchangeRate)
    }

    return {
      sellMin,
      sellMax,
    }
  }

  @computed get isSubmitBtnDisabled() {
    switch (this.mode) {
      case ScreenMode.Buy:
        const { buyMax, buyMin } = this.buyLimitAmounts
        return this.amount < buyMin || this.amount > buyMax
      case ScreenMode.Sell:
        const { sellMax, sellMin } = this.sellLimitAmounts
        return this.amount < sellMin || this.amount > sellMax
    }
  }

  @computed get displayFundLimit() {
    switch (this.mode) {
      case ScreenMode.Buy: {
        const amountCurrency = this.amountCurrency
        const { buyMin, buyMax } = this.buyLimitAmounts

        const displayMinBuyLimit = formatCurrency(buyMin, amountCurrency, false)
        const displayMaxBuyLimit = formatCurrency(buyMax, amountCurrency, false)

        if (this.amount < buyMin) {
          return `Minimum amount: ${displayMinBuyLimit}`
        }

        if (this.amount > buyMax) {
          return `Maximum amount: ${displayMaxBuyLimit}`
        }

        return null
      }
      case ScreenMode.Sell: {
        const amountCurrency = this.amountCurrency
        const { sellMin, sellMax } = this.sellLimitAmounts

        const displayMinSellLimit = formatCurrency(sellMin, amountCurrency, false)
        const displayMaxSellLimit = formatCurrency(sellMax, amountCurrency, false)

        if (this.amount < sellMin) {
          return `Minimum amount: ${displayMinSellLimit}`
        }

        if (this.amount > sellMax) {
          return `Maximum amount: ${displayMaxSellLimit}`
        }

        return null
      }
    }
  }

  @computed get switcherText() {
    const isBuyMode = this.mode === ScreenMode.Buy
    return {
      leftText: isBuyMode ? CurrencyCode.NGN : CurrencyCode.USD,
      rightText: isBuyMode ? CurrencyCode.USD : CurrencyCode.NGN,
    }
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    yield this.financeService.syncExchangeRates()

    switch (this.mode) {
      case ScreenMode.Buy:
        return (this.amountCurrency = CurrencyCode.NGN)
      case ScreenMode.Sell:
        return (this.amountCurrency = this.preferenceStore.currentCurrency)
    }
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @action onModalsClose() {
    this.showExceededLimitModal = false
    this.showExceededLimitWithKYCUpgrade = false
  }

  formatCurrency(item: number | string) {
    return displayCurrency(item).format()
  }

  @action onNumpadInput(value: string) {
    this.fsm.input(value as Alphabet)

    if (this.amountCurrency === this.srcCurrency) {
      if (this.fsm.value > AMOUNT_LIMIT) {
        const x = currency(AMOUNT_LIMIT).divide(this.exchangeRate).multiply(this.exchangeRate).value
        this.fsm.setValue(x)
      }
    } else {
      if (this.convertedAmount > AMOUNT_LIMIT) {
        const x = currency(AMOUNT_LIMIT).divide(this.exchangeRate).value
        this.fsm.setValue(x)
      }
    }
  }

  @action onNumpadRemove() {
    this.fsm.input(Alphabet.Delete)
  }

  @action onSwitch() {
    const newAmount = this.convertedAmount
    this.currencyToggle = !this.currencyToggle

    if (this.amountCurrency === this.srcCurrency) {
      this.amountCurrency = this.destCurrency
    } else {
      this.amountCurrency = this.srcCurrency
    }

    this.fsm.setValue(newAmount)
  }

  @action onMaxAmount() {
    this.fsm.setValue(this.maxAmount)
  }

  @flow *onSubmit() {
    const isValid = this.validateLimits()
    if (!isValid) {
      return
    }

    this.loading = true
    try {
      const amount = this.amountCurrency === this.srcCurrency ? this.amount : this.convertedAmount
      const amountUsdc = this.amountCurrency === this.destCurrency ? this.amount : this.convertedAmount

      yield this.calculateOrder(amount, amountUsdc)

      this.analyticsService.submit(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Amount, {
        mode: this.mode,
        amount: amountUsdc,
      })

      const options = this.getMatchingDummyScreenOptions()
      this.navigationService.navigate('MatchingDummy', options)
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else {
        this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
        this.monitoring.exception(err)
      }
    } finally {
      this.loading = false
    }
  }

  @flow *calculateOrder(amount: number, amountUsdc: number) {
    const input: ComputeFeeInput = {
      includeFees: false,
      amount: amount,
      amountUsdc: amountUsdc,
      exchangeRate: this.exchangeRate,
    }

    switch (this.mode) {
      case ScreenMode.Buy:
        yield this.orderService.calculateCurrentPurchaseOrder(input)
        break
      case ScreenMode.Sell:
        yield this.orderService.calculateCurrentSellOrder(input)
        break
      default:
        this.monitoring.exception(`Unexpected mode ${this.mode}`)
        break
    }
  }

  @action getMatchingDummyScreenOptions(): MainNavigatorDef['MatchingDummy'] {
    let delay = 0

    switch (this.mode) {
      case ScreenMode.Buy:
        delay = this.appConfig.buyDummyDelay
        break
      case ScreenMode.Sell:
        delay = this.appConfig.sellDummyDelay
        break
      default:
        this.monitoring.exception(`Unexpected mode ${this.mode}`)
        throw new Error('Something went wrong')
    }

    return {
      delay: delay,
      screen: 'Totals',
      params: {
        mode: this.mode,
      },
    }
  }

  @action validateLimits(): boolean {
    const {
      currentLevel: { current: currentLevel, next: nextLevel },
    } = this.levelStore

    switch (this.mode) {
      case ScreenMode.Buy:
      case ScreenMode.Sell:
        if (this.amount > this.maxAmount) {
          if (currentLevel.code !== UserLevel.Level0 && nextLevel) {
            this.showExceededLimitWithKYCUpgrade = true
          } else {
            this.showExceededLimitModal = true
          }

          return false
        }

        break
      default:
        this.monitoring.exception(`Unexpected amount entry mode ${this.mode}`)
        this.toastService.error('Something went wrong')
        return false
    }

    return true
  }

  @flow *onLevelUpgrade() {
    this.analyticsService.tap(AnalyticsFlow.Cash, AnalyticsScreen.Cash_Amount, {
      mode: this.mode,
      tag: 'kyc_level_upgrade',
    })

    this.showExceededLimitWithKYCUpgrade = false
    yield this.levelFlowService.triggerNextLevelFlow()
  }

  @flow *onContactSupport() {
    this.onModalsClose()

    yield this.supportService.navigateToHelpCenter()
  }
}
