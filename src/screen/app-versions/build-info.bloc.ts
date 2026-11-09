import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'
import Clipboard from '@react-native-clipboard/clipboard'

import { IBLoC } from '../../ioc'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { IPushNotificationService, PushNotificationServiceSymbol } from '../../services/push/push-notification.service'

import { BuildInfoNativeModuleSymbol, IBuildInfoNativeModule } from '../../services/native-module/build-info.nm'

import { IPushStore, PushStoreSymbol } from '../../services/store/push.store'
import { ActivityStoreSymbol, IActivityStore } from '../../services/store/activity.store'
import { ActivityType } from '../../models'
import { RemoteNotificationDataType } from '../../models/push-event'
import { ApiServiceSymbol, IApiService } from '../../services/api.service'
import { ISumsubService, SumsubServiceSymbol } from '../../services/sumsub.service'

@injectable()
export class BuildInfoBloc implements IBLoC {
  @inject(BuildInfoNativeModuleSymbol) buildInfoNM!: IBuildInfoNativeModule
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(PushNotificationServiceSymbol) pushNotificationService!: IPushNotificationService
  @inject(SumsubServiceSymbol) sumsubService!: ISumsubService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(PushStoreSymbol) pushStore!: IPushStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @observable info: Record<string, string | number | boolean> = {}

  @computed get keys() {
    return Object.keys(this.info) ?? []
  }

  @computed get dopplerEnv() {
    return this.info['CI_ENV']
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.info = yield this.buildInfoNM.getAll()
  }

  onCopyToClipboard(key: string) {
    Clipboard.setString(`${key}: ${this.info[key]}`)

    this.toastService.info('Copied!')
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onPushAllRewards() {
    const rewards = this.activityStore.activities.filter(x => x.type === ActivityType.Reward)

    for (const reward of rewards) {
      yield this.pushNotificationService.pushLocalNotification({
        title: `Push All Rewards TEST: ${reward.type}`,
        body: `Reward Type: ${reward.type}. Amount: ${reward.amount}. Amount USDC: ${reward.amountUsdc}`,
      })
      this.pushStore.pushForegroundNotifications({
        type: RemoteNotificationDataType.OrderReward,
        version: 'v1',
        showOnForeground: 'true',
        order: reward.order,
      })

      yield new Promise(x => setTimeout(x, 500))
    }
  }

  @flow *onSumSubStart() {
    yield this.sumsubService.launch()
  }
}
