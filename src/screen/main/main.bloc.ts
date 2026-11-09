import { inject, injectable, named } from 'inversify'
import { flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'
import { breadcrumb } from '../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { ActivityServiceSymbol, IActivityService } from '../../services/activity/activity.service'
import { IUserService, UserServiceSymbol } from '../../services/user.service'
import { IWalletService, WalletServiceSymbol } from '../../services/wallet.service'
import { ApiServiceSymbol, IApiService } from '../../services/api.service'
import { IPINService, PINServiceSymbol } from '../../services/pin.service'
import { IReferralService, ReferralServiceSymbol } from '../../services/referral.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../services/monitoring.service'

import { IPushNotificationService, PushNotificationServiceSymbol } from '../../services/push/push-notification.service'
import { AppOpenedFlowSymbol, IAppOpenedFlow } from '../../services/flows/app-opened.flow'
import { ILevelService, LevelServiceSymbol } from '../../services/level/level.service'
import { GeoServiceSymbol, IGeoService } from '../../services/geo.service'
import { CardServiceSymbol, ICardService } from '../../services/card.service'
import { ISupportChatService, SupportChatServiceSymbol } from '../../services/support/support-chat.service'
import { IWaitlistService, WaitlistServiceSymbol } from '../../services/waitlist.service'
import { IRewardService, RewardServiceSymbol } from '../../services/reward.service'
import { ILotteryService, LotteryServiceSymbol } from '../../services/lottery.service'

@breadcrumb('Main')
@injectable()
export class MainBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('MainBLoC') monitoring!: IMonitoringService

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(ApiServiceSymbol) api!: IApiService

  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(WalletServiceSymbol) walletService!: IWalletService
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(RewardServiceSymbol) rewardService!: IRewardService
  @inject(PushNotificationServiceSymbol) pushNotificationService!: IPushNotificationService
  @inject(ReferralServiceSymbol) referralService!: IReferralService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(CardServiceSymbol) cardService!: ICardService
  @inject(SupportChatServiceSymbol) supportChatService!: ISupportChatService
  @inject(WaitlistServiceSymbol) waitlistService!: IWaitlistService
  @inject(LotteryServiceSymbol) lotteryService!: ILotteryService
  @inject(GeoServiceSymbol) geoService!: IGeoService

  @inject(AppOpenedFlowSymbol) appOpenedFlow!: IAppOpenedFlow

  @observable loading = true

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    yield Promise.all([
      this.api.syncTransactionAvailabilityInfo(),
      this.userService.syncUserStatus(),
      this.userService.syncBanks(),

      this.levelService.syncCurrentLimits(),
      this.levelService.syncTransactionLimits(),

      // api and remote app config
      this.api.syncConfig(),

      // load referrer info: required on activity page
      this.referralService.syncReferralInfo(),

      // virtual card info
      this.cardService.syncVirtualCardStatus(),
      this.cardService.syncVirtualCardDetails(),
      this.cardService.syncCardIssueInfo(),

      // initialize Support Chat
      this.supportChatService.initialize(),
      this.supportChatService.syncFreshchatUnreadCount(),

      // sync waitlist
      this.waitlistService.syncWaitlist(),

      // sync summary reward info
      this.rewardService.syncRewardSummaryInfo(),

      // sync lottery
      this.lotteryService.syncLottery(),
    ])

    yield Promise.all([
      // provide a user info to a support chat
      this.supportChatService.syncUser(),
      this.appOpenedFlow.start(),
    ])
  }

  onParamsChange() {
    // nothing to do here
  }

  onDestroy() {
    this.appOpenedFlow.dispose()
  }
}
