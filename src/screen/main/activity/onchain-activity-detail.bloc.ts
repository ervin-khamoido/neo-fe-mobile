import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef, MainTabsNavigatorDef } from '../../common'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityStatus, IOnChainOrderDetails, OnChainOrderType } from '../../../models'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import format from 'date-fns/format'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'

type OnChainActivityDetailsParams = MainNavigatorDef['OnChainActivityDetails']

@breadcrumb('OnChain Activity Details')
@injectable()
export class OnChainActivityDetailsBLoC implements IBLoC<unknown, OnChainActivityDetailsParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(NavigationServiceSymbol) tabNavigationService!: INavigationService<MainTabsNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(SupportServiceSymbol) supportService!: ISupportService

  @inject(NavigationParamsSymbol) @observable navParams!: OnChainActivityDetailsParams

  @action onParamsChange(_, params: OnChainActivityDetailsParams) {
    this.navParams = params
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
    const activityDetails = this.activity.details as IOnChainOrderDetails
    return this.getOnChainActivityTitle(activityDetails)
  }

  @computed get lastStatus(): ActivityStatus {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get displayUSDAmount() {
    if (!this.activity) {
      return ''
    }

    const { amountUsdc, details } = this.activity
    const { orderType } = details as IOnChainOrderDetails
    const transactionSign = this.getSign(orderType)

    return `${transactionSign}${formatCurrency(amountUsdc, CurrencyCode.USD, false)}`
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uid)
  }

  @flow *onSupport() {
    yield this.supportService.navigateToHelpCenter()
  }

  onBackToWallet() {
    this.tabNavigationService.navigate('Wallet')
  }

  private getSign(activityOrderType: OnChainOrderType): string {
    switch (activityOrderType) {
      case OnChainOrderType.Receive:
        return '+'
      case OnChainOrderType.Send:
        return '-'
      default:
        return ''
    }
  }

  private getOnChainActivityTitle(activityDetails: IOnChainOrderDetails) {
    switch (activityDetails.orderType) {
      case OnChainOrderType.Receive:
        return 'Incoming Transfer'
      case OnChainOrderType.Send:
        return 'Outgoing Transfer'
      default:
        return 'On-Chain Transfer'
    }
  }
}
