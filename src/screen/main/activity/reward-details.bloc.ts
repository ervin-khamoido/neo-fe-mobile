import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { NavigationParamsSymbol } from '../../../ioc/component.scope'

import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityType, RewardType } from '../../../models'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'

type RewardDetailsParams = MainNavigatorDef['RewardDetails']

@breadcrumb('Reward Details')
@injectable()
export class RewardDetailsBLoC implements IBLoC<unknown, RewardDetailsParams> {
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @inject(NavigationParamsSymbol) @observable navParams!: RewardDetailsParams

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get uids() {
    return [this.uid]
  }

  @computed get rewardType(): RewardType | null {
    const { details } = this.activityStore.getOne(this.uid)

    if (details.type === ActivityType.Reward) {
      return details.rewardType
    } else {
      return null
    }
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uid)
    this.monitoring.breadcrumb(`Reward Details > ${this.rewardType}`)
  }

  @action onParamsChange(_, params: RewardDetailsParams) {
    this.navParams = params
  }
}
