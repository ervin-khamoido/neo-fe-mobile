import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { ProfileFontSize } from '../../../models/numbers'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'
import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'
import {
  IPushNotificationService,
  PushNotificationServiceSymbol,
} from '../../../services/push/push-notification.service'
import { ISupportStore, SupportStoreSymbol } from '../../../services/store/support.store'
import { ILevelService, LevelServiceSymbol } from '../../../services/level/level.service'
import { ConnectionError } from '@ts-awesome/request'
import { isServerError } from '../../../utils/helpers'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { Linking } from 'react-native'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { PRIVACY_POLICY_URL } from '../../../common/constrants'
import { IReferralStore, ReferralStoreSymbol } from '../../../services/store/referral.store'

@breadcrumb('Profile')
@injectable()
export class ProfileBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserServiceSymbol) userService: IUserService
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(PushNotificationServiceSymbol) pushNotificationService!: IPushNotificationService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(SupportStoreSymbol) supportStore!: ISupportStore
  @inject(ReferralStoreSymbol) referralStore!: IReferralStore

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get hasUnreadFreshchat() {
    return this.supportStore.freshchatUnreadCount !== 0
  }

  @observable bankAccountsLoading = false
  @observable helpCenterLoading = false

  @computed get email() {
    return this.userStore.me?.email
  }

  @computed get phone() {
    let phone = this.userStore.me?.phone
    if (!phone) {
      phone = '-'
    } else {
      phone = phone.slice(0, -4) + '****'
    }

    return phone
  }

  @computed get name() {
    return this.userStore.me?.userDetails?.fullName ?? ''
  }

  @computed get avatarUrl() {
    return this.userStore.me?.userDetails?.avatarUrl
  }

  @computed get username() {
    return this.userStore.me?.userDetails?.username ?? ''
  }

  @computed get referralTitle() {
    return this.referralStore.referrerInfo.rewardDetails?.shortReferralRewardInfo ?? ''
  }

  @computed get referralDescription() {
    return this.referralStore.referrerInfo.referralConditions
  }

  @computed get fontSize() {
    if (this.name.length > 15) {
      return ProfileFontSize.Small
    } else {
      return ProfileFontSize.Normal
    }
  }

  @computed get isAppLockEnabled() {
    return !!this.userStore.settings?.enableAppLock
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    yield this.userService.syncMe()
  }

  onParamsChange() {
    // nothing to do here
  }

  async onLogout() {
    this.authContext.signOut()
  }

  onDeleteAccount() {
    this.navigationService.navigate('DeleteAccount')
  }

  onSecurity() {
    this.navigationService.navigate('Security')
  }

  @flow *onPrivacy() {
    try {
      yield Linking.openURL(PRIVACY_POLICY_URL)
    } catch (err) {
      this.toast.error(err?.message ?? 'Unable to open the external link')
    }
  }

  onPersonalDetails() {
    this.navigationService.navigate('PersonalDetails')
  }

  onInvite() {
    this.navigationService.navigate('InviteLink')
  }

  async onAccountDetails() {
    await this.levelService.navigateToAccountLevel()
  }

  onUsername() {
    this.navigationService.navigate('Username')
  }

  @flow *onSavedBankAccounts() {
    this.bankAccountsLoading = true

    try {
      yield Promise.all([
        this.userService.syncBanks(),
        this.userService.syncBankAccounts(),
        this.userService.syncMe(),
        //
      ])

      this.navigationService.navigate('SavedBankAccounts')
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable.')
      } else if (isServerError(err)) {
        this.monitoring.exception(err)
        this.toast.error('Service temporary unavailable.')
      } else {
        this.monitoring.exception(err)
        this.toast.error(err?.message ?? 'Something went wrong')
      }
    } finally {
      this.bankAccountsLoading = false
    }
  }

  private buildInfoClicks = 0
  private buildInfoTimeout: any = 0

  onBuildInfo() {
    this.buildInfoClicks += 1

    if (this.buildInfoTimeout) {
      clearTimeout(this.buildInfoTimeout)
    }

    if (this.buildInfoClicks === BUILD_INFO_CLICKS_COUNT) {
      this.navigationService.navigate('BuildInfo')
      this.buildInfoClicks = 0
    } else {
      this.buildInfoTimeout = setTimeout(() => (this.buildInfoClicks = 0), BUILD_INFO_CLICKS_TIMEOUT)
    }
  }

  @flow *onSupport() {
    this.helpCenterLoading = true
    yield this.supportService.navigateToHelpCenter()
    this.helpCenterLoading = false
  }
}

const BUILD_INFO_CLICKS_COUNT = 10
const BUILD_INFO_CLICKS_TIMEOUT = 400
