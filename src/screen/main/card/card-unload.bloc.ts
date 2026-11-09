import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef, MainTabsNavigatorDef } from '../../common'
import { AMOUNT_LIMIT, CurrencyCode } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { Alphabet, AmountFSMSymbol, IAmountFSM } from '../../../utils/amount.fsm'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'

import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { CardServiceSymbol, ICardService } from '../../../services/card.service'
import { IWalletStore, WalletStoreSymbol } from '../../../services/store/wallet.store'
import { formatCurrency } from '../../../lib/utils/helpers'
import { IVirtualCardStore, VirtualCardStoreSymbol } from '../../../services/store/virtual-card.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Card, AnalyticsScreen.Card_Unload)
@breadcrumb('Card Unload')
@injectable()
export class CardUnloadBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef & MainTabsNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(VirtualCardStoreSymbol) virtualCardStore!: IVirtualCardStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(CardServiceSymbol) cardService!: ICardService
  @inject(AmountFSMSymbol) fsm!: IAmountFSM

  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @observable unloadLoading = false

  @computed get exchangeRate() {
    const { sellExchangeRate } = this.financeStore

    return sellExchangeRate
  }

  @computed get amount() {
    return this.fsm.value
  }

  @computed get displayAmount() {
    return formatCurrency(this.amount ?? 0)
  }

  @computed get isWithdrawCashDisabled() {
    const { minFundAmountUsdc, maxFundAmountUsdc } = this.virtualCardStore.cardIssueInfo

    return this.amount < minFundAmountUsdc || this.amount > maxFundAmountUsdc || this.unloadLoading
  }

  @computed get displayBalance() {
    const { balance } = this.virtualCardStore
    return formatCurrency(balance, CurrencyCode.USD, false)
  }

  @computed get displayFundLimit() {
    const { minUnloadAmountUsdc, maxUnloadAmountUsdc } = this.virtualCardStore.cardIssueInfo

    const displayMinAmount = formatCurrency(minUnloadAmountUsdc, CurrencyCode.USD, false)
    const displayMaxAmount = formatCurrency(maxUnloadAmountUsdc, CurrencyCode.USD, false)

    if (this.amount <= minUnloadAmountUsdc) {
      return `Minimum amount: ${displayMinAmount}`
    }

    if (this.amount >= maxUnloadAmountUsdc) {
      return `Maximum amount: ${displayMaxAmount}`
    }
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onNumpadInput(value: string) {
    this.fsm.input(value as Alphabet)

    if (this.amount > AMOUNT_LIMIT) {
      const x = currency(AMOUNT_LIMIT).divide(this.exchangeRate).multiply(this.exchangeRate).value
      this.fsm.setValue(x)
    }
  }

  @action onNumpadRemove() {
    this.fsm.input(Alphabet.Delete)
  }

  @flow *onWithdraw() {
    this.unloadLoading = true

    try {
      yield this.cardService.unloadVirtualCard({
        amount: this.amount,
      })

      this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_Unload, {
        amount: this.amount,
        status: 'success',
      })

      this.toastService.success('The funds were successfully withdrawn!')
    } catch (err: any) {
      this.toastService.error(
        'Oops, unable to withdraw cash. Please try again or contact support if the issue persists',
      )

      this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_Unload, {
        amount: this.amount,
        status: 'failure',
      })
    } finally {
      this.unloadLoading = false
    }

    this.navigationService.back()
  }
}
