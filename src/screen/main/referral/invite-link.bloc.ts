import { Linking } from 'react-native'
import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { DeviceServiceSymbol, IDeviceService } from '../../../services/device.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IReferralService, ReferralServiceSymbol } from '../../../services/referral.service'

import { IReferralStore, ReferralStoreSymbol } from '../../../services/store/referral.store'
import { truncate } from 'lodash'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Referral, AnalyticsScreen.Referral_Invite)
@breadcrumb('InviteLink')
@injectable()
export class InviteLinkBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(DeviceServiceSymbol) deviceService!: IDeviceService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(ReferralServiceSymbol) referralService!: IReferralService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(ReferralStoreSymbol) referrerStore!: IReferralStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @observable shareLoading = false

  @computed get info() {
    return this.referrerStore.referrerInfo
  }

  @computed get croppedReferralLink() {
    const referralLink = this.referrerStore.referrerInfo.referralLink
    return truncate(referralLink, { length: 25 })
  }

  @computed get referralLink() {
    return this.referrerStore.referrerInfo.referralLink
  }

  @computed get referralCode() {
    return this.userStore.me.userDetails.referrerCode
  }

  @computed get referralDescription() {
    return this.referrerStore.referrerInfo.referralConditions
  }

  @computed get invitationText() {
    return this.info.invitationText
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onCopy() {
    this.deviceService.copyInClipboard(this.referralLink)
    this.toast.info('Copied to clipboard')

    this.analyticsService.tap(AnalyticsFlow.Referral, AnalyticsScreen.Referral_Invite, {
      tag: 'copy_referral_link',
    })
  }

  @action onCopyReferralCode() {
    this.deviceService.copyInClipboard(this.referralCode)
    this.toast.info('Copied to clipboard')

    this.analyticsService.tap(AnalyticsFlow.Referral, AnalyticsScreen.Referral_Invite, {
      tag: 'copy_referral_code',
    })
  }

  @flow *onShare() {
    const { referralLink } = this.info

    this.shareLoading = true

    const hasShared = yield this.deviceService.shareText(this.invitationText, {
      url: referralLink,
      title: 'Invite to Neobank',
      emailSubject: 'Invitation to Neobank',
    })

    if (hasShared) {
      this.toast.success('🎉 Your referral link has been successfully shared!')
    }

    this.analyticsService.tap(AnalyticsFlow.Referral, AnalyticsScreen.Referral_Invite, {
      tag: 'share_referral_link',
    })

    this.shareLoading = false
  }

  async onLink() {
    await Linking.openURL(this.referralLink)
  }
}
