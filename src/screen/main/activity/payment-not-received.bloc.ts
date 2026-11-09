import { inject, injectable } from 'inversify'
import { computed, makeObservable, flow, observable, action } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { displayCurrency, formatCurrency } from '../../../lib/utils/helpers'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import format from 'date-fns/format'

type PaymentNotReceivedParams = MainNavigatorDef['PaymentNotReceived']

@breadcrumb('Payment Not Received')
@injectable()
export class PaymentNotReceivedBLoC implements IBLoC<unknown, PaymentNotReceivedParams> {
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(NavigationParamsSymbol) @observable navParams!: PaymentNotReceivedParams

  @observable helpCenterLoading = false

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get headerShows() {
    return this.navParams.headerShown
  }

  @computed get formattedAmountUsd() {
    return formatCurrency(this.activity?.amountUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get formattedAmount() {
    return formatCurrency(this.activity?.amount ?? 0, CurrencyCode.NGN, false)
  }

  @computed get activityDate() {
    return format(new Date(this.lastStatus?.statusDatetime), 'dd MMM yy, hh:mm aa')
  }

  @computed get lastStatus() {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uid)
  }

  onDisplayValue(item: number | string) {
    return displayCurrency(item).format()
  }

  @flow *onPaymentMade() {
    this.helpCenterLoading = true

    yield this.supportService.navigateToHelpCenter()

    this.helpCenterLoading = false
  }

  @action onParamsChange(_, params: PaymentNotReceivedParams) {
    this.navParams = params
  }
}
