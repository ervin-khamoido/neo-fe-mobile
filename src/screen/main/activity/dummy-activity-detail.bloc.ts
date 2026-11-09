import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'

import { IBLoC } from '../../../ioc'
import { CurrencyCode } from '../../../common/constrants'
import { MainNavigatorDef } from '../../common'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityType } from '../../../models'
import { formatCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'
import { formatActivityStatus } from '../../../utils/helpers'

import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'

type DummyActivityDetailsParams = MainNavigatorDef['DummyActivityDetails']

@breadcrumb('Dummy Activity Details')
@injectable()
export class DummyActivityDetailsBLoC implements IBLoC<unknown, DummyActivityDetailsParams> {
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(NavigationParamsSymbol) @observable navParams!: DummyActivityDetailsParams

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get statusName() {
    let statusDefinitions = []
    switch (this.activity.type) {
      case ActivityType.Buy:
        statusDefinitions = this.activityStore.poStatusDefinitions
        break
      case ActivityType.Sell:
        statusDefinitions = this.activityStore.soStatusDefinitions
        break
      case ActivityType.Yield:
        statusDefinitions = this.activityStore.yoStatusDefinitions
        break
      case ActivityType.Reward:
        statusDefinitions = this.activityStore.rewardStatusDefinitions
        break
    }

    const definition = statusDefinitions.find(x => x.status === this.activity.status)

    if (definition) {
      return definition.name
    } else {
      return formatActivityStatus(this.activity.status)
    }
  }

  @computed get lastStatus() {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get statusAt() {
    const statusDatetime = this.lastStatus?.statusDatetime
    return format(new Date(statusDatetime), 'dd MMM yy, hh:mm aa')
  }

  @computed get headerShows() {
    return this.navParams.headerShown
  }

  @computed get displayAmount() {
    return formatCurrency(this.activity.amount, CurrencyCode.NGN, false)
  }

  @computed get displayAmountUsdc() {
    return formatCurrency(this.activity.amountUsdc, CurrencyCode.USD, false)
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uid)
  }

  @action onParamsChange(_, params: DummyActivityDetailsParams) {
    this.navParams = params
  }
}
