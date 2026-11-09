import { breadcrumb } from '../../../utils/breadcrumb'
import { inject, injectable, named } from 'inversify'
import { IBLoC } from '../../../ioc'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { MainNavigatorDef } from '../../common'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityType, RewardType } from '../../../models'
import { IRewardService, RewardServiceSymbol } from '../../../services/reward.service'
import { IRewardStore, RewardStoreSymbol } from '../../../services/store/reward.store'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { getScreenForActivity } from '../common'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

type NavParams = MainNavigatorDef['RewardTopic']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Reward, AnalyticsScreen.Reward_CenterByType, (_, params) => ({
  mode: params.mode,
}))
@breadcrumb('Rewards Topic')
@injectable()
export class RewardsTopicBLoC implements IBLoC<unknown, NavParams> {
  @inject(AppMonitoringServiceSymbol) @named('Wallet') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(RewardServiceSymbol) rewardService!: IRewardService
  @inject(ToastServiceSymbol) toastService!: IToastService

  @inject(RewardStoreSymbol) rewardStore!: IRewardStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @inject(NavigationParamsSymbol) navParams!: NavParams

  @observable loading: boolean = false
  @observable syncListLoading: boolean = false

  @computed get mode() {
    return this.navParams.mode
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @computed get activity() {
    switch (this.mode) {
      case ActivityType.Yield:
        return this.rewardStore.rewardInterestEarnedActivities?.activities ?? []
      case RewardType.Cashback_Buy:
        return this.rewardStore.rewardCashbackActivities?.activities ?? []
      case RewardType.Referral_Referrer:
        return this.rewardStore.rewardReferralsActivities?.activities ?? []
      case RewardType.Promotion_Campaign:
        return this.rewardStore.rewardPromotionCampaignActivities?.activities ?? []
      default:
        return []
    }
  }

  @computed get title() {
    switch (this.mode) {
      case ActivityType.Yield:
        return 'Interest Earnings'
      case RewardType.Cashback_Buy:
        return 'Cash Back'
      case RewardType.Referral_Referrer:
        return 'Referrals'
      case RewardType.Promotion_Campaign:
        return 'Neobank App Saturdays'
      default:
        return 'Other Rewards'
    }
  }

  @computed get badgeTitle() {
    switch (this.mode) {
      case ActivityType.Yield:
        return 'Total Interest Earned'
      case RewardType.Cashback_Buy:
        return 'Total Cash Back Earned'
      case RewardType.Referral_Referrer:
        return 'Total Earned from Referrals'
      case RewardType.Promotion_Campaign:
        return 'Total Earned from Neobank App Saturdays'
      default:
        return 'Total Earned'
    }
  }

  @computed get badgeMonthAmountTitle() {
    switch (this.mode) {
      case ActivityType.Yield:
      case RewardType.Cashback_Buy:
      case RewardType.Referral_Referrer:
        return `Earned in ${this.currentMonth}`
      case RewardType.Promotion_Campaign:
        return `Collected in ${this.currentMonth}`
      default:
        return 'Earned in current month'
    }
  }

  @computed get currentMonth() {
    switch (this.mode) {
      case ActivityType.Yield:
        return this.rewardStore.rewardsSummaryInfo?.yieldTotals.currentMonth
      case RewardType.Cashback_Buy:
        return this.rewardStore.rewardsSummaryInfo?.cashbackBuyTotals.currentMonth
      case RewardType.Referral_Referrer:
        return this.rewardStore.rewardsSummaryInfo?.referralTotals.currentMonth
      case RewardType.Promotion_Campaign:
        return this.rewardStore.rewardsSummaryInfo?.promotionCampaignTotals.currentMonth
      default:
        return 'current month'
    }
  }

  @computed get totalEarned() {
    let amount = 0

    switch (this.mode) {
      case ActivityType.Yield:
        amount = this.rewardStore.rewardsSummaryInfo?.yieldTotals.totalEarned
        break
      case RewardType.Cashback_Buy:
        amount = this.rewardStore.rewardsSummaryInfo?.cashbackBuyTotals.totalEarned
        break
      case RewardType.Referral_Referrer:
        amount = this.rewardStore.rewardsSummaryInfo?.referralTotals.totalEarned
        break
      case RewardType.Promotion_Campaign:
        amount = this.rewardStore.rewardsSummaryInfo?.promotionCampaignTotals.totalEarned
        break
    }

    return formatCurrency(amount, CurrencyCode.USD, false)
  }

  @computed get totalEarnedCurrentMonth() {
    let amount = 0

    switch (this.mode) {
      case ActivityType.Yield:
        amount = this.rewardStore.rewardsSummaryInfo?.yieldTotals.totalEarnedCurrentMonth
        break
      case RewardType.Cashback_Buy:
        amount = this.rewardStore.rewardsSummaryInfo?.cashbackBuyTotals.totalEarnedCurrentMonth
        break
      case RewardType.Referral_Referrer:
        amount = this.rewardStore.rewardsSummaryInfo?.referralTotals.totalEarnedCurrentMonth
        break
      case RewardType.Promotion_Campaign:
        amount = this.rewardStore.rewardsSummaryInfo?.promotionCampaignTotals.totalEarnedCurrentMonth
        break
    }

    return formatCurrency(amount, CurrencyCode.USD, false)
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @flow *initialize() {
    yield this.syncLastActivities()
  }

  @flow
  *onDetailPress(uid: string) {
    const activity = this.activityStore.getOne(uid)

    if (!activity) {
      return
    }
    const screen = getScreenForActivity(activity)
    this.navigationService.navigate(screen, { uid })
  }

  @flow *syncLastActivities() {
    if (this.syncListLoading) {
      return
    }

    this.syncListLoading = true

    try {
      yield this.rewardService.syncRewardsActivities(this.mode, 0)
      yield this.rewardService.syncRewardSummaryInfo()
    } catch (err) {
      this.toastService.error(err.message, 5000)
    } finally {
      this.syncListLoading = false
    }
  }

  @flow *loadActivities() {
    if (this.loading) {
      return
    }

    this.loading = true

    try {
      const cursor = this.rewardStore.currentCursor(this.mode)

      if (cursor) {
        yield this.rewardService.syncRewardsActivities(this.mode, cursor ?? 0)
      }
    } catch (err) {
      this.toastService.error(err.message, 5000)
    } finally {
      this.loading = false
    }
  }
}
