import { inject, injectable } from 'inversify'
import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from 'mobx'
import _ from 'lodash'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { ActivityType, RewardType, RewardTypes } from '../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IPushStore, PushStoreSymbol } from '../../../services/store/push.store'
import { IPushRewardData, RemoteNotificationDataType } from '../../../models/push-event'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { PINStoreSymbol, IPINStore } from '../../../services/store/pin.store'

const RewardTypesToProcess = [RewardType.Cashback_Buy]

@injectable()
export class RewardBottomPopUpBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(PushStoreSymbol) pushStore!: IPushStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(PINStoreSymbol) pinStore!: IPINStore

  private subscriptionDisposer!: IReactionDisposer

  @observable currentState = RewardWizardState.Idle

  @computed get notifications() {
    return this.pushStore.foregroundNotificationData.filter(
      x => x.type === RemoteNotificationDataType.OrderReward,
    ) as IPushRewardData[]
  }

  @observable uids: string[] = []
  @observable rewardType: RewardType | null = null

  @computed get showReward() {
    return this.rewardType !== null
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.subscriptionDisposer = reaction(
      () => [this.notifications, this.currentState, this.pinStore.requestPIN],
      _.debounce(() => this.processRewardPushes(), 1000),
    )
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onModalClose() {
    this.currentState = RewardWizardState.Idle
    this.rewardType = null
    this.uids = []
  }

  @action processRewardPushes() {
    if (this.pinStore.requestPIN) {
      return
    }

    if (this.currentState === RewardWizardState.Processing) {
      return
    }

    if (this.notifications.length === 0) {
      return
    }

    this.currentState = RewardWizardState.Processing

    for (const rewardType of RewardTypesToProcess) {
      const orderUids = this.notifications.map(x => x.order)
      const rewardActivities = this.activityStore.getManyByOrder(orderUids).filter(x => {
        const { details } = x

        return details.type === ActivityType.Reward && details.details?.rewardType === rewardType
      })

      if (rewardActivities.length !== 0) {
        this.pushStore.popRewardNotificationsForOrders(rewardActivities.map(x => x.order))

        this.rewardType = rewardType
        this.uids = rewardActivities.map(x => x.uid)

        return
      }
    }

    this.currentState = RewardWizardState.Idle
  }

  onDestroy() {
    this.subscriptionDisposer?.()
  }
}

enum RewardWizardState {
  Idle,
  Processing,
}
