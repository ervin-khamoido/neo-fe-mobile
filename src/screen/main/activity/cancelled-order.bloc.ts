import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityType } from '../../../models'
import { IActivityTimelineStatus } from '../tabs/components/activity-timeline'
import { displayCurrency, formatCurrency } from '../../../lib/utils/helpers'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import format from 'date-fns/format'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'

type CancelledOrderParams = MainNavigatorDef['CancelledOrder']

@breadcrumb('Cancelled Order')
@injectable()
export class CancelledOrderBLoC implements IBLoC<unknown, CancelledOrderParams> {
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC

  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(SupportServiceSymbol) supportService!: ISupportService

  @inject(NavigationParamsSymbol) @observable navParams!: CancelledOrderParams

  @observable helpCenterLoading = false

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }
  @computed get lastStatus() {
    return this.activity.statuses[this.activity.statuses.length - 1]
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

  @action onParamsChange(_, params: CancelledOrderParams) {
    this.navParams = params
  }
  @flow *onBackToWallet() {
    this.navigationService.navigate('MainTabs')
  }
}
