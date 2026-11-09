import { inject, injectable, named } from 'inversify'

import { IUserStore, UserStoreSymbol } from '../store/user.store'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { ActivityServiceSymbol, IActivityService } from './activity.service'

import { MainNavigatorDef } from '../../screen/common'
import { ActivityStoreSymbol, IActivityStore } from '../store/activity.store'

export interface ILatestUnseenRewardService {
  process(): boolean
}

export const LatestUnseenRewardServiceSymbol = Symbol.for('ILatestUnseenRewardService')

@injectable()
export class LatestUnseenRewardService implements ILatestUnseenRewardService {
  @inject(AppMonitoringServiceSymbol) @named('LatestUnseenRewardService') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  process(): boolean {
    const { latestUnseenReward } = this.activityStore

    if (!latestUnseenReward) {
      return false
    }

    this.navigation.navigate('RewardDetails', { uid: latestUnseenReward.uid })
    this.activityStore.resetLatestUnseenReward()

    return true
  }
}
