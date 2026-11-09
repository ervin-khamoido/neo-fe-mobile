import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { getScreenForActivity } from '../common'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IReferralStore, ReferralStoreSymbol } from '../../../services/store/referral.store'

@breadcrumb('Transactions')
@injectable()
export class TransactionsBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(ReferralStoreSymbol) referralStore!: IReferralStore

  @computed get activity() {
    return this.activityStore.history
  }

  @computed get shortReferralRewardInfo() {
    const defaultValue = ''
    const referrerInfo = this.referralStore.referrerInfo
    if (!referrerInfo) {
      return defaultValue
    }

    return referrerInfo.rewardDetails?.shortReferralRewardInfo ?? defaultValue
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onDetailPress(uid: string) {
    const activity = this.activityStore.getOne(uid)

    if (!activity) {
      return
    }
    const screen = getScreenForActivity(activity)
    this.navigationService.navigate(screen, { uid })
  }

  onReferPress() {
    this.navigationService.navigate('InviteLink')
  }
}
