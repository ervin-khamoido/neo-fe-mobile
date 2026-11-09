import { inject, injectable, named } from 'inversify'
import { AppStateStatus } from 'react-native'
import { reaction, IReactionDisposer } from 'mobx'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { ActivityServiceSymbol, IActivityService } from '../activity/activity.service'
import { ILatestUnseenRewardService, LatestUnseenRewardServiceSymbol } from '../activity/latest-unseen-reward.service'
import { IPushNotificationService, PushNotificationServiceSymbol } from '../push/push-notification.service'
import { IInitialPushService, InitialPushServiceSymbol } from '../push/initial-push.service'

import { DeviceStoreSymbol, IDeviceStore } from '../store/device.store'

export interface IAppOpenedFlow {
  start(): Promise<void>
  dispose(): void
}

export const AppOpenedFlowSymbol = Symbol.for('IAppOpenedFlow')

@injectable()
export class AppOpenedFlow implements IAppOpenedFlow {
  @inject(AppMonitoringServiceSymbol) @named('AppOpenedFlow') monitoring!: IMonitoringService

  @inject(PushNotificationServiceSymbol) pushNotificationService!: IPushNotificationService
  @inject(InitialPushServiceSymbol) initialPushService!: IInitialPushService

  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(LatestUnseenRewardServiceSymbol) latestUnseenRewardService!: ILatestUnseenRewardService

  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore

  private disposer: IReactionDisposer | null = null

  async start(): Promise<void> {
    const isInitialPushProcessed = await this.processInitialNotification()

    if (!isInitialPushProcessed) {
      await this.activityService.syncLatestUnseenReward()
      this.latestUnseenRewardService.process()
    }

    this.disposer = reaction(
      () => this.deviceStore.appState,
      (x, y) => this.handleBackgroundToForegroundTransition(x, y),
    )
  }

  dispose(): void {
    this.disposer?.()
    this.disposer = null
  }

  private async handleBackgroundToForegroundTransition(currState: AppStateStatus, prevState: AppStateStatus) {
    const InactiveStates: AppStateStatus[] = ['inactive', 'background']

    // when app is transitioning from the background
    if (InactiveStates.includes(prevState) && currState === 'active') {
      await this.processInitialNotification()
    }
  }

  private async processInitialNotification(): Promise<boolean> {
    await this.pushNotificationService.syncInitialNotification()

    try {
      return await this.initialPushService.process()
    } catch (err: any) {
      this.monitoring.exception(err)
      return false
    }
  }
}
