import { injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'
import { RewardActivityListOutput, RewardsSummaryOutput } from '../../models/reward/reward-info'
import { ActivityType, RewardModeType, RewardType } from '../../models'
import { formatCurrency } from '../../lib/utils/helpers'
import { CurrencyCode } from '../../common/constrants'

export interface IRewardStore {
  readonly rewardsSummaryInfo: RewardsSummaryOutput | null
  readonly rewardInterestEarnedActivities: RewardActivityListOutput | null
  readonly rewardCashbackActivities: RewardActivityListOutput | null
  readonly rewardReferralsActivities: RewardActivityListOutput | null
  readonly rewardPromotionCampaignActivities: RewardActivityListOutput | null

  readonly totalEarnedAmount: string
  readonly totalEarnedInCurrentMonthAmount: string

  setRewardSummaryInfo(summaryInfo: RewardsSummaryOutput): void

  setRewardInterestEarnedActivities(activities: RewardActivityListOutput, toUpdate: boolean): void
  setRewardCashbackActivities(activities: RewardActivityListOutput, toUpdate: boolean): void
  setRewardReferralsActivities(activities: RewardActivityListOutput, toUpdate: boolean): void
  setRewardPromotionCampaignActivities(activities: RewardActivityListOutput, toUpdate: boolean): void

  currentCursor(rewardType: RewardModeType): number | null
}

export const RewardStoreSymbol = Symbol.for('IRewardStore')

@cleanable
@injectable()
export class RewardStore implements IRewardStore, ICleanable {
  @observable rewardsSummaryInfo: RewardsSummaryOutput | null

  @observable rewardInterestEarnedActivities: RewardActivityListOutput | null
  @observable rewardCashbackActivities: RewardActivityListOutput | null
  @observable rewardReferralsActivities: RewardActivityListOutput | null
  @observable rewardPromotionCampaignActivities: RewardActivityListOutput | null

  currentCursor(rewardType: RewardModeType): number | null {
    switch (rewardType) {
      case RewardType.Referral_Referrer:
        return this.rewardReferralsActivities?.nextCursor
      case RewardType.Cashback_Buy:
        return this.rewardCashbackActivities?.nextCursor
      case RewardType.Promotion_Campaign:
        return this.rewardPromotionCampaignActivities?.nextCursor
      case ActivityType.Yield:
        return this.rewardInterestEarnedActivities?.nextCursor
      default:
        return null
    }
  }

  @computed get totalEarnedAmount() {
    let total = 0
    let rewardSummaryInfo = this.rewardsSummaryInfo

    for (const key in rewardSummaryInfo) {
      const value = rewardSummaryInfo[key].totalEarned
      total += value
    }

    return formatCurrency(total, CurrencyCode.USD, false)
  }

  @computed get totalEarnedInCurrentMonthAmount() {
    let total = 0
    let rewardSummaryInfo = this.rewardsSummaryInfo

    for (const key in rewardSummaryInfo) {
      const value = rewardSummaryInfo[key].totalEarnedCurrentMonth ?? 0
      total += value
    }

    return formatCurrency(total, CurrencyCode.USD, false)
  }

  constructor() {
    makeObservable(this)
  }

  @action setRewardSummaryInfo(summaryInfo: RewardsSummaryOutput): void {
    this.rewardsSummaryInfo = summaryInfo
  }

  @action setRewardInterestEarnedActivities(activities: RewardActivityListOutput, toUpdate: boolean): void {
    const oldActivities = this.rewardInterestEarnedActivities?.activities ?? []

    if (toUpdate) {
      this.rewardInterestEarnedActivities = {
        ...activities,
        activities: [...oldActivities, ...activities.activities],
      }
    } else {
      this.rewardInterestEarnedActivities = activities
    }
  }

  @action setRewardCashbackActivities(activities: RewardActivityListOutput, toUpdate: boolean): void {
    const oldActivities = this.rewardCashbackActivities?.activities ?? []

    if (toUpdate) {
      this.rewardCashbackActivities = {
        ...activities,
        activities: [...oldActivities, ...activities.activities],
      }
    } else {
      this.rewardCashbackActivities = activities
    }
  }

  @action setRewardReferralsActivities(activities: RewardActivityListOutput, toUpdate: boolean): void {
    const oldActivities = this.rewardReferralsActivities?.activities ?? []

    if (toUpdate) {
      this.rewardReferralsActivities = {
        ...activities,
        activities: [...oldActivities, ...activities.activities],
      }
    } else {
      this.rewardReferralsActivities = activities
    }
  }

  @action setRewardPromotionCampaignActivities(activities: RewardActivityListOutput, toUpdate: boolean): void {
    const oldActivities = this.rewardPromotionCampaignActivities?.activities ?? []

    if (toUpdate) {
      this.rewardPromotionCampaignActivities = {
        ...activities,
        activities: [...oldActivities, ...activities.activities],
      }
    } else {
      this.rewardPromotionCampaignActivities = activities
    }
  }

  @action clean() {
    this.rewardsSummaryInfo = null
    this.rewardInterestEarnedActivities = null
    this.rewardCashbackActivities = null
    this.rewardReferralsActivities = null
    this.rewardPromotionCampaignActivities = null
  }
}
