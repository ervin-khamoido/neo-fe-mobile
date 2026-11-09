import { inject, injectable, named } from 'inversify'

import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { IPushStore, PushStoreSymbol } from '../store/push.store'
import { IPushRewardData } from '../../models/push-event'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { ActivityServiceSymbol, IActivityService } from '../activity/activity.service'

import { MainNavigatorDef } from '../../screen/common'
import { ActivityStoreSymbol, IActivityStore } from '../store/activity.store'

export interface IInitialPushService {
  process(): Promise<boolean>
}

export const InitialPushServiceSymbol = Symbol.for('IInitialPushService')

@injectable()
export class InitialPushService implements IInitialPushService {
  @inject(AppMonitoringServiceSymbol) @named('InitialPushService') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PushStoreSymbol) pushStore!: IPushStore

  async process(): Promise<boolean> {
    const { me } = this.userStore
    const { notificationOpenedAppData } = this.pushStore

    if (!notificationOpenedAppData) {
      return false
    }

    if (!me) {
      return false
    }

    let processed
    switch (notificationOpenedAppData.type) {
      case 'order.reward':
        processed = await this.processRewardPush(notificationOpenedAppData)
        break
      default:
        processed = false
        break
    }

    if (processed) {
      this.pushStore.resetNotificationOpenedApp()
    }
  }

  private async processRewardPush(data: IPushRewardData): Promise<boolean> {
    switch (data.version) {
      case 'v1': {
        const { order } = data

        // hopefully firebase is sync and we have the activity already
        let activity = this.activityStore.getByOrder(order)
        if (!activity) {
          // if not, we'll sync with server
          await this.activityService.syncActivityForOrder(order)
        }

        activity = this.activityStore.getByOrder(order)
        if (!activity) {
          // if the activity doesn't exist after sync, then something went wrong, and we can't process the notification
          this.monitoring.exception(`invalid order uid = ${order}`)
          return
        }

        this.navigation.navigate('RewardDetails', { uid: activity.uid })

        return true
      }
      default:
        return false
    }
  }
}
