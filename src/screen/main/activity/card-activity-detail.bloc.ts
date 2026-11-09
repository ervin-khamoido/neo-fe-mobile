import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef, MainTabsNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityStatus, CardOrderType, EventTypes, ICardOrderDetails, TapEventProps } from '../../../models'
import { displayCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import format from 'date-fns/format'

type CardActivityDetailsParams = MainNavigatorDef['CardActivityDetails']

@breadcrumb('Card Activity Details')
@injectable()
export class CardActivityDetailsBLoC implements IBLoC<unknown, CardActivityDetailsParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(NavigationServiceSymbol) tabNavigationService!: INavigationService<MainTabsNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(NavigationParamsSymbol) @observable navParams!: CardActivityDetailsParams

  readonly destCurrency: CurrencyCode = CurrencyCode.USD

  @observable loading = false

  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get transactionDate() {
    return format(new Date(this.lastStatus?.statusDatetime), 'dd MMM yy, hh:mm aa')
  }

  @computed get activityTitle() {
    const activityDetails = this.activity.details as ICardOrderDetails
    return this.getCardActivityTitle(activityDetails)
  }

  @computed get lastStatus(): ActivityStatus {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get displayUSDAmount() {
    const { orderType } = this.activity.details as ICardOrderDetails
    const transactionSign = this.getSign(orderType)
    const currencySymbol = this.destCurrencySymbol
    const amount = this.onDisplayValue(this.activity?.amountUsdc ?? 0)

    return transactionSign + currencySymbol + amount
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

  @flow *onSupport() {
    this.navigationService.navigate('EmailSupport')
  }

  onBackToCard() {
    this.tabNavigationService.navigate('Card')
  }

  @action onParamsChange(_, params: CardActivityDetailsParams) {
    this.navParams = params
  }

  private getSign(activityOrderType: CardOrderType): string {
    switch (activityOrderType) {
      case CardOrderType.Unload:
      case CardOrderType.Spend:
      case CardOrderType.Fee:
      case CardOrderType.SpendFee:
        return '-'
      case CardOrderType.Fund:
      case CardOrderType.Reversal:
        return '+'
      default:
    }
  }

  private getCardActivityTitle(activityDetails: ICardOrderDetails) {
    switch (activityDetails.orderType) {
      case CardOrderType.Fund:
        return 'Added to Card'
      case CardOrderType.Unload:
        return 'Credited to Primary Wallet'
      case CardOrderType.Spend:
        return activityDetails?.providerDescription ?? 'Online Purchase'
      case CardOrderType.Reversal:
        return 'Reversal'
      case CardOrderType.Fee:
        return 'Card Creation'
      case CardOrderType.SpendFee:
        return 'Transaction Fee'
      default:
        return 'Online Purchase'
    }
  }
}
