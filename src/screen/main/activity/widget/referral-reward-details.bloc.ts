import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'

import { IBLoC } from '../../../../ioc'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { MainNavigatorDef } from '../../../common'
import { CurrencyCode } from '../../../../common/constrants'
import { formatCurrency } from '../../../../lib/utils/helpers'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { ActivityServiceSymbol, IActivityService } from '../../../../services/activity/activity.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../../services/store/activity.store'

import { RewardDetailsProps } from './referral-reward-details.widget'
import { ActivityType, IRewardOrderDetails } from '../../../../models'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'

@injectable()
export class ReferralRewardDetailsWidgetBLoC implements IBLoC<RewardDetailsProps> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(AppMonitoringServiceSymbol) @named('ReferralRewardDetailsWidgetBLoC') monitoring!: IMonitoringService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @inject(InitialPropsSymbol) @observable props!: RewardDetailsProps

  @computed get uids() {
    return this.props.uids
  }

  @computed get activities() {
    return this.activityStore.getMany(this.uids)
  }

  @computed get details() {
    return this.activities.filter(x => x.type === ActivityType.Reward).map(x => x.details as IRewardOrderDetails)
  }

  @computed get description() {
    switch (this.details.length) {
      case 0: {
        return ''
      }
      case 1: {
        return this.details[0].description
      }
      default: {
        return `You just received a bonus for the ${this.details.length} referrals!`
      }
    }
  }

  @computed get lastStatus() {
    switch (this.details.length) {
      case 1: {
        const activity = this.activities[0]
        const statusesLength = activity.statuses.length

        return activity.statuses[statusesLength - 1]
      }
      default: {
        return null
      }
    }
  }

  @computed get completedAt() {
    if (this.lastStatus) {
      const statusDatetime = new Date(this.lastStatus.statusDatetime)

      return format(statusDatetime, 'dd MMM yy, hh:mm aa')
    } else {
      return null
    }
  }

  @computed get displayAmount() {
    switch (this.activities.length) {
      case 1: {
        const activity = this.activities[0]

        return formatCurrency(activity.amount ?? 0, CurrencyCode.NGN, false)
      }
      default: {
        const accumulatedAmount = this.activities.reduce((res, curr) => res + curr.amount, 0)

        return formatCurrency(accumulatedAmount, CurrencyCode.NGN, false)
      }
    }
  }

  @computed get displayAmountUsdc() {
    switch (this.activities.length) {
      case 1: {
        const activity = this.activities[0]

        return formatCurrency(activity.amountUsdc ?? 0, CurrencyCode.USD, false)
      }
      default: {
        const accumulatedAmountUsdc = this.activities.reduce((res, curr) => res + curr.amountUsdc, 0)

        return formatCurrency(accumulatedAmountUsdc, CurrencyCode.USD, false)
      }
    }
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    switch (this.uids.length) {
      case 1: {
        this.activityService.markAsRead(this.uids[0])
        break
      }
      default: {
        this.activityService.markAllAsRead(this.uids)
        break
      }
    }
  }

  @action onParamsChange(props: RewardDetailsProps) {
    this.props = props
  }

  @flow *onReferMore() {
    this.props.onClose?.()
    this.navigationService.navigate('InviteLink')
  }
}
