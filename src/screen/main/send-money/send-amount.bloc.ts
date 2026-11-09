import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'
import { isNil } from 'lodash'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { AMOUNT_LIMIT, CurrencyCode } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { Alphabet, AmountFSMSymbol, IAmountFSM } from '../../../utils/amount.fsm'
import { formatCurrency } from '../../../lib/utils/helpers'
import { MaxLimitReason, MaxLimitReasonLabel, SendMode } from '../../../models'
import { UserLevel } from '../../../models/level/definitions'
import { UserLevelLimitOutput } from '../../../models/level/current-user-level-info'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../services/store/current-order.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

import { NavigationParamsSymbol } from '../../../ioc/component.scope'

type NavParams = MainNavigatorDef['SendAmount']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Send, AnalyticsScreen.Send_Amount, (_, params) => ({
  mode: params.mode,
}))
@breadcrumb('Send Amount')
@injectable()
export class SendAmountBLoC implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(AmountFSMSymbol) fsm!: IAmountFSM

  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  @observable loading = false
  @observable showExceededLimitModal = false
  @observable showPinModal = false

  @computed get mode(): SendMode {
    return this.navParams.mode
  }

  @computed get exchangeRate() {
    const { sellExchangeRate } = this.financeStore

    return sellExchangeRate
  }

  @computed get currentLevelLimits(): UserLevelLimitOutput | null {
    return this.levelStore.currentLevel?.limits
  }

  @computed get amount() {
    return this.fsm.value
  }

  @computed get displayAmount() {
    return formatCurrency(this.amount)
  }

  @computed get displayConvertedAmount() {
    const convertedAmount = currency(this.amount).multiply(this.exchangeRate)

    return formatCurrency(convertedAmount.value, CurrencyCode.NGN, false)
  }

  @computed get sendLimits() {
    return this.levelStore.currentLimits?.Send
  }

  @computed get displayLimit() {
    const maxLimit = this.sendLimits?.maxLimit ?? 0

    return formatCurrency(maxLimit, CurrencyCode.USD, false)
  }

  @computed get displayLimitReason() {
    const reason = this.sendLimits?.reason

    return reason ? MaxLimitReasonLabel[reason].toLowerCase() : ''
  }

  @computed get isSendDisabled() {
    const minAmount = 0.01 // one penny

    return this.amount < minAmount || this.loading
  }

  @computed get displayModalHeader() {
    const reason = this.sendLimits?.reason
    const userLevel = this.levelStore.currentLevel.current?.code

    return reason === MaxLimitReason.BalanceLimit
      ? 'Amount Exceeds Available Funds'
      : userLevel === UserLevel.Level1
      ? 'Upgrade your account'
      : 'Amount Exceeds Limit'
  }

  @computed get displayModalBody() {
    const maxLimit = this.sendLimits?.maxLimit ?? 0
    const reason = this.sendLimits?.reason

    const maxLimitFormatted = formatCurrency(maxLimit, CurrencyCode.USD, false)

    return reason === MaxLimitReason.BalanceLimit
      ? `Sorry, you can only send up to ${maxLimitFormatted} right now. The amount entered exceeds your available balance.`
      : this.limitModalBodyContent
  }

  @computed get isAppLockEnabled() {
    return !!this.userStore.settings?.enableAppLock
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.currentOrderStore.startTransferOrder()
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

  @action onNext() {
    switch (this.mode) {
      case SendMode.Internal:
        this.onNextInternal()
        break
      case SendMode.OnChain:
        this.onNextOnChain()
        break
    }
  }

  @action onNextInternal() {
    if (!this.isAppLockEnabled) {
      this.showPinModal = true
      return
    }

    if (this.amount > this.sendLimits?.maxLimit) {
      this.showExceededLimitModal = true
      return
    }

    this.analyticsService.submit(AnalyticsFlow.Send, AnalyticsScreen.Send_Amount, {
      amount: this.amount,
      mode: this.mode,
    })
    this.currentOrderStore.updateTransferOrder('amountUsdc', this.amount)
    this.navigationService.navigate('SendRecipient')
  }

  @action onNextOnChain() {
    if (this.amount > this.sendLimits?.maxLimit) {
      this.showExceededLimitModal = true
      return
    }

    this.analyticsService.submit(AnalyticsFlow.Send, AnalyticsScreen.Send_Amount, {
      amount: this.amount,
      mode: this.mode,
    })
    this.navigationService.navigate('SendOnChainAddress', { amountUsdc: this.amount })
  }

  @action onModalsClose() {
    this.showExceededLimitModal = false
  }

  @action onPinModalConfirm() {
    this.showPinModal = false
    this.navigationService.navigate('EnableAppLock')
  }

  @action onPinModalCancel() {
    this.showPinModal = false
  }

  private get limitModalBodyContent() {
    const { send1DayLimitUsdc, send7DayLimitUsdc, send30DayLimitUsdc } = this.currentLevelLimits ?? {}
    const display1DayLimit = !isNil(send1DayLimitUsdc)
      ? formatCurrency(send1DayLimitUsdc, CurrencyCode.USD, false)
      : 'no limit'
    const display7DayLimit = !isNil(send7DayLimitUsdc)
      ? formatCurrency(send7DayLimitUsdc, CurrencyCode.USD, false)
      : 'no limit'
    const display30DayLimit = !isNil(send30DayLimitUsdc)
      ? formatCurrency(send30DayLimitUsdc, CurrencyCode.USD, false)
      : 'no limit'

    const userLevel = this.levelStore.currentLevel.current?.code
    const reason = this.sendLimits?.reason

    const maxLimit = this.sendLimits?.maxLimit ?? 0
    const maxLimitFormatted = formatCurrency(maxLimit, CurrencyCode.USD, false)

    if ([UserLevel.Level0, UserLevel.Level1].includes(userLevel)) {
      return 'You need to upgrade your account to Level 2 before sending money. Please go to your profile to do so.'
    }

    if (userLevel === UserLevel.Level2) {
      const messages = {
        [MaxLimitReason.OneDayLimit]: `Sorry, you can only send up to ${display1DayLimit} per day. To increase your limit please contact customer support.`,
        [MaxLimitReason.SevenDayLimit]: `Sorry, you can only send up to ${display7DayLimit} every 7-days. To increase your limit please contact customer support.`,
        [MaxLimitReason.ThirtyDayLimit]: `Sorry, you can only send up to ${display30DayLimit} every 30-days. To increase your limit please contact customer support.`,
      }

      return messages[reason]
    }

    return `Sorry, you can only send up to ${maxLimitFormatted}. Please go to your profile and upgrade your account.`
  }
}
