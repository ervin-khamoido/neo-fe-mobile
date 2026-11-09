import React from 'react'
import { Platform, View } from 'react-native'
import Share from 'react-native-share'
import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'
import { captureRef } from 'react-native-view-shot'
import { ShareOpenResult, ShareOptions } from 'react-native-share/lib/typescript/types'

import { IBLoC } from '../../../../ioc'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { MainNavigatorDef } from '../../../common'
import { CurrencyCode } from '../../../../common/constrants'
import { formatCurrency, formatPercentage } from '../../../../lib/utils/helpers'
import { ActivityType, IRewardOrderCashbackActivityDetails, IRewardOrderDetails, RewardType } from '../../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { ActivityServiceSymbol, IActivityService } from '../../../../services/activity/activity.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../../services/store/activity.store'

import { CashbackDetailsProps } from './cashback-reward-details.widget'

import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { IReferralStore, ReferralStoreSymbol } from '../../../../services/store/referral.store'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'

@injectable()
export class CashbackDetailsWidgetBLoC implements IBLoC<CashbackDetailsProps> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(AppMonitoringServiceSymbol) @named('CashbackDetailsWidgetBLoC') monitoring!: IMonitoringService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ReferralStoreSymbol) referralStore!: IReferralStore

  @inject(InitialPropsSymbol) @observable props!: CashbackDetailsProps

  shareImageRef = React.createRef<View>()

  @computed get uids() {
    return this.props.uids
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uids[0])
  }

  @computed get description() {
    switch (this.activity?.details.type) {
      case ActivityType.Reward:
        return this.activity.details.description
      default:
        return ''
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

  @computed get cashbackDetails() {
    const EmptyDetailsToPreventCrash: IRewardOrderCashbackActivityDetails = {
      rewardType: RewardType.Cashback_Buy,
      totalUsdc: 0,
      percentage: 0,
      amount: 0,
      cashbackUsdc: 0,
      version: 'v1',
    }

    // Sometimes when the uids prop is cleared, the component is updated
    // before being unmounted. That was a reason of the crash.
    if (!this.activity) {
      return EmptyDetailsToPreventCrash
    }

    const { details } = this.activity

    switch (details.type) {
      case ActivityType.Reward: {
        switch (details.rewardType) {
          case RewardType.Cashback_Buy:
            return details.details as IRewardOrderCashbackActivityDetails
          default:
            this.monitoring.exception(
              `The CashbackRewardDetails got an unexpected reward activity (${this.activity.uid}) of type=${details.rewardType}`,
            )
            return EmptyDetailsToPreventCrash
        }
      }
      default: {
        this.monitoring.exception(
          `The CashbackRewardDetails got an unexpected activity (${this.activity.uid}) of type=${details.type}`,
        )
        return EmptyDetailsToPreventCrash
      }
    }
  }

  @computed get cashbackPercentage() {
    return formatPercentage(this.cashbackDetails.percentage)
  }

  @computed get cashbackAmountSaved() {
    return formatCurrency(this.cashbackDetails.totalUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get invitationText() {
    const { referrerInfo } = this.referralStore

    return referrerInfo?.invitationText ?? ''
  }

  @computed get isReferralRewardActive() {
    const { referrerInfo } = this.referralStore

    return !!referrerInfo?.rewardDetails?.isActive
  }

  @computed get minRefereeSaveAmountUsdcFormatted() {
    const { minRefereeSaveAmountUsdcFormatted } = this.referralStore.referrerInfo.rewardDetails

    return minRefereeSaveAmountUsdcFormatted ?? 0
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uids[0])
  }

  @action onParamsChange(props: CashbackDetailsProps) {
    this.props = props
  }

  @flow *onShare() {
    this.analyticsService.tap(AnalyticsFlow.Reward, AnalyticsScreen.Reward_Activity, {
      tag: `share_reward_${(this.activity.details as IRewardOrderDetails).rewardType}`,
    })

    const fileName = `neobank-cashback-${this.activity?.orderReferenceNumber}`
    const uri = yield captureRef(this.shareImageRef.current, {
      fileName,
      format: 'png',
      quality: 0.7,
    })

    try {
      const shareOptions: ShareOptions = {
        title: 'Share Cashback Win',
        url: uri,
        type: 'image/png',
        filename: fileName,
      }

      if (Platform.OS === 'android') {
        shareOptions.message = this.invitationText
      }

      const result: ShareOpenResult = yield Share.open(shareOptions)

      if (result.success) {
        // TODO: discuss
        // this.toast.success('Y')
      }
    } catch (ignore: any) {
      // ignore if user dismisses the share
    }
  }
}
