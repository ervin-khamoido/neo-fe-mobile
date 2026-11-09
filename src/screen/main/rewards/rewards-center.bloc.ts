import { breadcrumb } from '../../../utils/breadcrumb'
import { inject, injectable } from 'inversify'
import { IBLoC } from '../../../ioc'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { MainNavigatorDef } from '../../common'
import { ActivityType, RewardModeType, RewardType } from '../../../models'
import { computed, flow, makeObservable } from 'mobx'
import { IRewardStore, RewardStoreSymbol } from '../../../services/store/reward.store'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { format } from 'date-fns'
import { IRewardService, RewardServiceSymbol } from '../../../services/reward.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Reward, AnalyticsScreen.Reward_Center)
@breadcrumb('Rewards Center')
@injectable()
export class RewardsCenterBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(RewardServiceSymbol) rewardService!: IRewardService

  @inject(RewardStoreSymbol) rewardStore!: IRewardStore

  @computed get totalEarned() {
    return this.rewardStore.totalEarnedAmount
  }

  @computed get totalEarnedInCurrentMonthAmount() {
    return this.rewardStore.totalEarnedInCurrentMonthAmount
  }

  @computed get currentMonth() {
    const currentDate = new Date()
    const currentMonthInWord = format(currentDate, 'MMMM')
    return currentMonthInWord
  }
  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    yield this.rewardService.syncRewardSummaryInfo()
  }

  onParamsChange() {
    // nothing to do here
  }

  totalEarnedAmountByTopic(rewardType?: RewardModeType) {
    const info = this.rewardStore.rewardsSummaryInfo

    switch (rewardType) {
      case RewardType.Referral_Referrer:
        return formatCurrency(info?.referralTotals.totalEarned ?? 0, CurrencyCode.USD, false)
      case RewardType.Cashback_Buy:
        return formatCurrency(info?.cashbackBuyTotals.totalEarned ?? 0, CurrencyCode.USD, false)
      case RewardType.Promotion_Campaign:
        return formatCurrency(info?.promotionCampaignTotals.totalEarned ?? 0, CurrencyCode.USD, false)
      case ActivityType.Yield:
        return formatCurrency(info?.yieldTotals.totalEarned ?? 0, CurrencyCode.USD, false)
    }
  }

  onTopic(mode: RewardModeType) {
    this.navigationService.navigate('RewardTopic', { mode })
  }
}
