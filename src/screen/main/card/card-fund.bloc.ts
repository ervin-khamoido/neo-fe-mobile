import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef, MainTabsNavigatorDef } from '../../common'
import { AMOUNT_LIMIT, CurrencyCode } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { Alphabet, AmountFSMSymbol, IAmountFSM } from '../../../utils/amount.fsm'
import { formatCurrency } from '../../../lib/utils/helpers'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'

import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { CardServiceSymbol, ICardService } from '../../../services/card.service'
import { IWalletStore, WalletStoreSymbol } from '../../../services/store/wallet.store'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { OneTimeAction } from '../../../services/pin.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import {
  IOneTimeActionFlow,
  IOneTimeActionResult,
  OneTimeActionFlowSymbol,
} from '../../../services/flows/one-time-action.flow'
import { IVirtualCardStore, VirtualCardStoreSymbol } from '../../../services/store/virtual-card.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Card, AnalyticsScreen.Card_BVN)
@breadcrumb('Card Fund')
@injectable()
export class CardFundBloc implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef & MainTabsNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(CardServiceSymbol) cardService!: ICardService
  @inject(AppMonitoringServiceSymbol) monitoringService!: IMonitoringService
  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(VirtualCardStoreSymbol) virtualCardStore!: IVirtualCardStore

  @inject(AmountFSMSymbol) fsm!: IAmountFSM

  @observable addCashLoading = false
  @observable showExceededLimitModal = false

  @computed get exchangeRate() {
    const { sellExchangeRate } = this.financeStore

    return sellExchangeRate
  }

  @computed get amount() {
    return this.fsm.value
  }

  @computed get displayAmount() {
    return formatCurrency(this.amount)
  }

  @computed get isAddCashDisabled() {
    const { minFundAmountUsdc, maxFundAmountUsdc } = this.virtualCardStore.cardIssueInfo

    return this.amount < minFundAmountUsdc || this.amount > maxFundAmountUsdc || this.addCashLoading
  }

  @computed get displayBalance() {
    const { balance } = this.walletStore
    return formatCurrency(balance.balance, CurrencyCode.USD, false)
  }

  @computed get displayFundLimit() {
    const { minFundAmountUsdc, maxFundAmountUsdc } = this.virtualCardStore.cardIssueInfo

    const displayMinAmount = formatCurrency(minFundAmountUsdc, CurrencyCode.USD, false)
    const displayMaxAmount = formatCurrency(maxFundAmountUsdc, CurrencyCode.USD, false)

    if (this.amount <= minFundAmountUsdc) {
      return `Minimum amount: ${displayMinAmount}`
    }

    if (this.amount >= maxFundAmountUsdc) {
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

  @flow *onAdd() {
    this.addCashLoading = true

    const cardIssueInfo = this.virtualCardStore.cardIssueInfo

    try {
      const result: IOneTimeActionResult<void> = yield this.oneTimeActionFlow.auto(
        OneTimeAction.CreateFundCardOrder,
        () =>
          this.cardService.fundVirtualCard({
            amount: this.amount,
          }),
      )

      if (!result.fulfilled) {
        this.toastService.info('The PIN code is required to top up the virtual card.')
      } else {
        this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_Fund, {
          amount: this.amount,
          status: 'success',
        })

        const displayAmount = formatCurrency(this.amount, CurrencyCode.USD, false)
        this.toastService.success(
          `Your card is being topped up with ${displayAmount}.\nFunds and balances will be updated soon.`,
          10 * 1000,
        )
      }
    } catch (err: any) {
      this.toastService.error(
        'Oops, unable to top up your card. Please try again or contact support if the issue persists',
      )

      this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_Fund, {
        amount: this.amount,
        status: 'failure',
      })
    } finally {
      this.addCashLoading = false
    }

    this.navigationService.back()
  }
}
