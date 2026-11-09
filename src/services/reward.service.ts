import { inject, injectable, named } from 'inversify'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ApiServiceSymbol, IApiService } from './api.service'
import { IRewardStore, RewardStoreSymbol } from './store/reward.store'
import { RewardActivityListOutput, RewardsSummaryOutput } from '../models/reward/reward-info'
import { Activity, ActivityType, RewardModeType, RewardType } from '../models'
import { ActivityUtilsServiceSymbol, IActivityUtilsService } from './activity/activity-utils.service'

export interface IRewardService {
  syncRewardSummaryInfo(): Promise<void>
  syncRewardsActivities(rewardType: RewardModeType, cursor?: number, pageSize?: number): Promise<void>
}

export const RewardServiceSymbol = Symbol.for('IRewardService')

@injectable()
export class RewardService implements IRewardService {
  @inject(AppMonitoringServiceSymbol) @named('RewardService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(RewardStoreSymbol) rewardStore!: IRewardStore
  @inject(ActivityUtilsServiceSymbol) activityUtilsService!: IActivityUtilsService

  async syncRewardSummaryInfo(): Promise<void> {
    const result = await this.api.withAuth(http =>
      http.get('/api/v1/user/rewards/summary', { Model: RewardsSummaryOutput }),
    )

    this.rewardStore.setRewardSummaryInfo(result)
  }

  async syncRewardsActivities(rewardType: RewardModeType, cursor?: number, pageSize?: number): Promise<void> {
    // TODO: what magic is this?
    let url =
      rewardType === ActivityType.Yield
        ? `/api/v1/user/activity/list?type=${rewardType}`
        : `/api/v1/user/activity/list?type=${ActivityType.Reward}&rewardType=${rewardType}`

    if (cursor) {
      url += `&cursor=${cursor}`
    }

    if (pageSize) {
      url += `&pageSize=${pageSize}`
    }

    const result = await this.api.withAuth(http =>
      http.get(url, {
        Model: RewardActivityListOutput,
      }),
    )

    this.prepareActivities(result.activities)

    switch (rewardType) {
      case RewardType.Referral_Referrer:
        this.rewardStore.setRewardReferralsActivities(result, !!cursor)
        break
      case RewardType.Cashback_Buy:
        this.rewardStore.setRewardCashbackActivities(result, !!cursor)
        break
      case RewardType.Promotion_Campaign:
        this.rewardStore.setRewardPromotionCampaignActivities(result, !!cursor)
        break
      case ActivityType.Yield:
        this.rewardStore.setRewardInterestEarnedActivities(result, !!cursor)
        break
    }
  }

  private prepareActivities(activities: Activity[]): void {
    activities?.forEach(a => {
      this.activityUtilsService.floorActivityAmount(a)
    })
  }
}
