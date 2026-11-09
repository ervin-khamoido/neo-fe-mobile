import React from 'react'
import { Platform, View } from 'react-native'
import { captureRef } from 'react-native-view-shot'
import { ShareOpenResult, ShareOptions } from 'react-native-share/lib/typescript/types'
import Share from 'react-native-share'
import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'

import { IBLoC } from '../../../../ioc'

import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { CurrencyCode } from '../../../../common/constrants'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { ActivityServiceSymbol, IActivityService } from '../../../../services/activity/activity.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../../services/store/activity.store'
import { IReferralStore, ReferralStoreSymbol } from '../../../../services/store/referral.store'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { ActivityType, IRewardOrderDetails } from '../../../../models'
import { DefaultDetailsProps } from './default-reward-details.widget'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'

@injectable()
export class DefaultDetailsWidgetBLoC implements IBLoC<DefaultDetailsProps> {
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ReferralStoreSymbol) referralStore!: IReferralStore

  @inject(InitialPropsSymbol) @observable props!: DefaultDetailsProps

  shareImageRef = React.createRef<View>()

  @computed get uids() {
    return this.props.uids
  }

  @computed get activity() {
    const activities = this.activityStore.getMany(this.uids)

    return activities[0]
  }

  @computed get description() {
    switch (this.activity?.details.type) {
      case ActivityType.Reward:
        return this.activity.details.description ?? 'You just received a bonus!'
      default:
        return 'You just received a bonus!'
    }
  }

  @computed get lastStatus() {
    if (this.activity) {
      return this.activity.statuses[this.activity.statuses.length - 1]
    } else {
      return null
    }
  }

  @computed get completedAt() {
    if (this.lastStatus) {
      const statusDatetime = this.lastStatus.statusDatetime
      return format(new Date(statusDatetime), 'dd MMM yy, hh:mm aa')
    } else {
      return ''
    }
  }

  @computed get displayAmount() {
    return formatCurrency(this.activity?.amount ?? 0, CurrencyCode.NGN, false)
  }

  @computed get displayAmountUsdc() {
    return formatCurrency(this.activity?.amountUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get invitationText() {
    const { referrerInfo } = this.referralStore

    return referrerInfo?.invitationText ?? ''
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    switch (this.uids.length) {
      case 0:
        break
      case 1:
        this.activityService.markAsRead(this.uids[0])
        break
      default:
        this.activityService.markAllAsRead(this.uids)
        break
    }
  }

  @action onParamsChange(props: DefaultDetailsProps) {
    this.props = props
  }

  @flow *onShare() {
    this.analyticsService.tap(AnalyticsFlow.Reward, AnalyticsScreen.Reward_Activity, {
      tag: `share_reward_${(this.activity.details as IRewardOrderDetails).rewardType}`,
    })

    const fileName = `neobank-reward-${this.activity?.orderReferenceNumber}`
    const uri = yield captureRef(this.shareImageRef.current, {
      fileName,
      format: 'png',
      quality: 0.7,
    })

    try {
      const shareOptions: ShareOptions = {
        title: 'Share Bonus Win',
        url: uri,
        type: 'image/png',
        filename: fileName,
      }

      if (Platform.OS === 'android') {
        shareOptions.message = this.invitationText
      }

      const result: ShareOpenResult = yield Share.open(shareOptions)

      if (result.success) {
        this.toastService.success('Done!')
      }
    } catch (ignore: any) {
      // ignore if user dismisses the share
    }
  }
}
