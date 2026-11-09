import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityType } from '../../../models'
import { displayCurrency, formatCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'

import { IActivityTimelineStatus } from '../tabs/components/activity-timeline'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import format from 'date-fns/format'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../services/store/current-order.store'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'

type TransactionsDetailsParams = MainNavigatorDef['TransactionsDetails']

@breadcrumb('Transactions Details')
@injectable()
export class TransactionsDetailsBLoC implements IBLoC<unknown, TransactionsDetailsParams> {
  get srcCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.NGN].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.USD].symbol
  }

  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(SupportServiceSymbol) supportService!: ISupportService

  @inject(NavigationParamsSymbol) @observable navParams!: TransactionsDetailsParams

  @observable helpCenterLoading = false

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get activityDate() {
    return format(new Date(this.lastStatus?.statusDatetime), 'dd MMM yy, hh:mm aa')
  }

  @computed get lastStatus() {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get amountWithSymbol() {
    return formatCurrency(this.activity?.amountUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get exchangeAmountWithSymbol() {
    if (this.activity.details.type === ActivityType.Buy && !!this.activity?.details.amount) {
      return formatCurrency(this.activity?.details.amount, CurrencyCode.NGN, false)
    }

    return formatCurrency(this.activity?.amount ?? 0, CurrencyCode.NGN, false)
  }

  @computed get userBankAccountNumber() {
    switch (this.activity.details.type) {
      case ActivityType.Buy:
      case ActivityType.Sell:
        return this.activity.details.userBankAccountNumber
      default:
        return '--'
    }
  }

  @computed get statuses(): IActivityTimelineStatus[] {
    let pendingStatuses = []
    switch (this.activity?.type) {
      case ActivityType.Buy:
        pendingStatuses = this.activityStore.poStatusDefinitions
        break
      case ActivityType.Sell:
        pendingStatuses = this.activityStore.soStatusDefinitions
        break
      case ActivityType.Yield:
        pendingStatuses = this.activityStore.yoStatusDefinitions
        break
      case ActivityType.Reward:
        pendingStatuses = this.activityStore.rewardStatusDefinitions
        break
      default:
      // nothing
    }

    pendingStatuses = pendingStatuses.filter(x => !x.isClosed && x.isVisible)

    return pendingStatuses.map(s => {
      return {
        name: s.name,
        completed: !!this.activity.statuses.find(st => st.status === s.status),
      }
    })
  }

  @computed get headerShows() {
    return this.navParams.headerShown ?? true
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
    this.helpCenterLoading = true

    yield this.supportService.navigateToHelpCenter()

    this.helpCenterLoading = false
  }

  @action onParamsChange(_, params: TransactionsDetailsParams) {
    this.navParams = params
  }
}
