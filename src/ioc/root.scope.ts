import { Container } from 'inversify'
import { NavigationContainerRef } from '@react-navigation/core'
import { HttpTransport, HttpTransportSymbol, IHttpTransport } from '@ts-awesome/request'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Toast from 'react-native-toast-notifications'

import { NavigatorFactorySymbol, NavigatorSymbol, ToastFactorySymbol, ToastSymbol } from '../symbols'
import { IMonitoringConfig, MonitoringConfig, MonitoringConfigSymbol, MonitoringType } from '../models/config'
import { AsyncPersistance, IPersistance, PersistanceSymbol } from '../lib/utils/persistance'
import { ConfigSymbol, IConfig, ReactNativeConfig } from '../lib/utils/config'

import { AuthStore, AuthStoreSymbol, IAuthStore } from '../services/store/auth.store'
import {
  AppMonitoringServiceSymbol,
  ConsoleMonitoringService,
  IMonitoringService,
  SentryService,
} from '../services/monitoring.service'
import { IToastService, ToastService, ToastServiceSymbol } from '../services/toast.service'
import { INavigationService, NavigationService, NavigationServiceSymbol } from '../services/navigation.service'
import { IUserStore, UserStore, UserStoreSymbol } from '../services/store/user.store'
import { IUserService, UserService, UserServiceSymbol } from '../services/user.service'
import { IApiService, ApiService, ApiServiceSymbol } from '../services/api.service'
import { ILinkService, LinkService, LinkServiceSymbol } from '../services/link.service'
import { IInvitationStore, InvitationStore, InvitationStoreSymbol } from '../services/store/invitation.store'
import { FinanceStore, FinanceStoreSymbol, IFinanceStore } from '../services/store/finance.store'
import { FinanceService, FinanceServiceSymbol, IFinanceService } from '../services/finance.service'
import { AppConfigStore, AppConfigStoreSymbol, IAppConfigStore } from '../services/store/app-config.store'
import { ActivityService, ActivityServiceSymbol, IActivityService } from '../services/activity/activity.service'
import { ActivityStore, ActivityStoreSymbol, IActivityStore } from '../services/store/activity.store'
import { IWalletService, WalletService, WalletServiceSymbol } from '../services/wallet.service'
import { PreferenceStore, PreferenceStoreSymbol, IPreferenceStore } from '../services/store/preference.store'
import { ISupportService, SupportService, SupportServiceSymbol } from '../services/support/support.service'
import { IWizardService, WizardService, WizardServiceSymbol } from '../services/wizard.service'
import { AmountFSM, AmountFSMSymbol, IAmountFSM } from '../utils/amount.fsm'
import { IPINService, PINService, PINServiceSymbol } from '../services/pin.service'
import { IPINStore, PINStore, PINStoreSymbol } from '../services/store/pin.store'
import { NeobankHttpTransport } from '../services/transport/neobank.transport'
import { DeviceService, DeviceServiceSymbol, IDeviceService } from '../services/device.service'
import { AmplitudeConfig, IAmplitudeConfig, AmplitudeConfigSymbol } from '../models/config/amplitude.configs'
import { IWalletStore, WalletStore, WalletStoreSymbol } from '../services/store/wallet.store'
import { IOneTimeActionFlow, OneTimeActionFlow, OneTimeActionFlowSymbol } from '../services/flows/one-time-action.flow'
import { ISanitizer, Sanitizer, SanitizerSymbol } from '../utils/sanitizer'
import {
  AnalyticsConfig,
  AnalyticsType,
  IAnalyticsConfig,
  IAnalyticsConfigSymbol,
} from '../models/config/analytics.config'
import {
  BuildInfoNativeModule,
  BuildInfoNativeModuleSymbol,
  IBuildInfoNativeModule,
} from '../services/native-module/build-info.nm'
import { ISecureStorage, SecureStorage, SecureStorageSymbol } from '../services/secure.storage'
import { DeviceStore, DeviceStoreSymbol, IDeviceStore } from '../services/store/device.store'
import { ISplashService, SplashService, SplashServiceSymbol } from '../services/splash.service'
import { IAuthContext } from '../services/context/auth/interfaces'
import { AuthContext, AuthContextSymbol } from '../services/context/auth'
import {
  IPushNotificationService,
  PushNotificationService,
  PushNotificationServiceSymbol,
} from '../services/push/push-notification.service'
import { IPushStore, PushStore, PushStoreSymbol } from '../services/store/push.store'
import { IOrderService, OrderService, OrderServiceSymbol } from '../services/order.service'
import { CurrentOrderStore, CurrentOrderStoreSymbol, ICurrentOrderStore } from '../services/store/current-order.store'
import { IOrdersStore, OrdersStore, OrdersStoreSymbol } from '../services/store/orders.store'
import {
  CampaignTrackingService,
  CampaignTrackingServiceSymbol,
  ICampaignTrackingService,
  NoCampaignTrackingService,
} from '../services/analytics/campaign-analytics.service'
import { FacebookSDKConfig, FacebookSDKConfigSymbol, IFacebookSDKConfig } from '../models/config/facebooksdk.configs'
import { ISupportStore, SupportStore, SupportStoreSymbol } from '../services/store/support.store'
import { HapticService, HapticServiceSymbol, IHapticService } from '../services/haptic.service'
import {
  CampaignPersistenceService,
  CampaignPersistenceServiceSymbol,
  ICampaignPersistenceService,
} from '../services/analytics/campaign-persitence.service'
import { IReferralStore, ReferralStore, ReferralStoreSymbol } from '../services/store/referral.store'
import { IReferralService, ReferralService, ReferralServiceSymbol } from '../services/referral.service'
import {
  IInitialPushService,
  InitialPushService,
  InitialPushServiceSymbol,
} from '../services/push/initial-push.service'
import {
  ILatestUnseenRewardService,
  LatestUnseenRewardService,
  LatestUnseenRewardServiceSymbol,
} from '../services/activity/latest-unseen-reward.service'
import { AppOpenedFlow, AppOpenedFlowSymbol, IAppOpenedFlow } from '../services/flows/app-opened.flow'
import { ISignUpStore, SignUpStore, SignUpStoreSymbol } from '../services/store/sign-up.store'
import { ILevelStore, LevelStore, LevelStoreSymbol } from '../services/store/level.store'
import { ILevelOneService, LevelOneService, LevelOneServiceSymbol } from '../services/level/level-one.service'
import { ILevelService, LevelService, LevelServiceSymbol } from '../services/level/level.service'
import { GeoService, GeoServiceSymbol, IGeoService } from '../services/geo.service'
import { GoogleConfig, GoogleConfigSymbol, IGoogleConfig } from '../models/config/google.config'
import { ISumsubService, SumsubService, SumsubServiceSymbol } from '../services/sumsub.service'
import { ILevelTwoService, LevelTwoService, LevelTwoServiceSymbol } from '../services/level/level-two.service'
import { ILevelFlowService, LevelFlowService, LevelFlowServiceSymbol } from '../services/level/level-flow.service'
import { IRemoteConfigService, RemoteConfigService, RemoteConfigServiceSymbol } from '../services/remote-config.service'
import { CardService, CardServiceSymbol, ICardService } from '../services/card.service'
import { IVirtualCardStore, VirtualCardStore, VirtualCardStoreSymbol } from '../services/store/virtual-card.store'
import { IOnChainStore, OnChainStore, OnChainStoreSymbol } from '../services/store/on-chain.store'
import { IOnChainService, OnChainService, OnChainServiceSymbol } from '../services/on-chain.service'
import {
  ISupportChatService,
  SupportChatService,
  SupportChatServiceSymbol,
} from '../services/support/support-chat.service'
import { FreshchatConfig, FreshchatConfigSymbol, IFreshchatConfig } from '../models/config/freshchat.config'
import { IWaitlistService, WaitlistService, WaitlistServiceSymbol } from '../services/waitlist.service'
import { IRewardService, RewardService, RewardServiceSymbol } from '../services/reward.service'
import { IRewardStore, RewardStore, RewardStoreSymbol } from '../services/store/reward.store'
import {
  ActivityUtilsService,
  ActivityUtilsServiceSymbol,
  IActivityUtilsService,
} from '../services/activity/activity-utils.service'
import { ILockStore, LockStore, LockStoreSymbol } from '../services/store/lock.store'
import { ILockService, LockService, LockServiceSymbol } from '../services/lock.service'
import {
  AnalyticsImplementationSymbol,
  AnalyticsService,
  AnalyticsServiceSymbol,
  IAnalyticsImplementation,
  IAnalyticsService,
} from '../services/analytics/analytics.service'
import { AmplitudeService } from '../services/analytics/impl/amplitude.service'
import { ConsoleAnalyticsService } from '../services/analytics/impl/console.service'
import { createFeatureAccessFactory, FeatureAccessFactorySymbol } from '../utils/feature-access'
import { ILotteryStore, LotteryStore, LotteryStoreSymbol } from '../services/store/lottery.store'
import { ILotteryService, LotteryService, LotteryServiceSymbol } from '../services/lottery.service'

async function configure(container: Container): Promise<void> {
  // browser specific
  container.bind<NavigationContainerRef<any> | null>(NavigatorSymbol).toConstantValue(null)
  container
    .bind<() => NavigationContainerRef<any> | null>(NavigatorFactorySymbol)
    .toFactory(() => () => container.get(NavigatorSymbol))
  container.bind<Toast | null>(ToastSymbol).toConstantValue(null)
  container.bind<() => Toast | null>(ToastFactorySymbol).toFactory(() => () => container.get(ToastSymbol))

  //
  container.bind<ISanitizer>(SanitizerSymbol).to(Sanitizer).inSingletonScope()

  // utils
  const localPersistance = await AsyncPersistance.provide(AsyncStorage)
  container.bind<IPersistance>(PersistanceSymbol).toConstantValue(localPersistance)
  container.bind<IAmountFSM>(AmountFSMSymbol).to(AmountFSM)

  // config
  container.bind<IConfig>(ConfigSymbol).to(ReactNativeConfig).inSingletonScope()
  container.bind<IMonitoringConfig>(MonitoringConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new MonitoringConfig(config)
  })
  container.bind<IAmplitudeConfig>(AmplitudeConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new AmplitudeConfig(config)
  })
  container.bind<IAnalyticsConfig>(IAnalyticsConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new AnalyticsConfig(config)
  })
  container.bind<IFacebookSDKConfig>(FacebookSDKConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new FacebookSDKConfig(config)
  })
  container.bind<IGoogleConfig>(GoogleConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new GoogleConfig(config)
  })
  container.bind<IFreshchatConfig>(FreshchatConfigSymbol).toDynamicValue(() => {
    const config = container.get<IConfig>(ConfigSymbol)
    return new FreshchatConfig(config)
  })

  // stores
  bindStores(container)

  // services
  bindServices(container)

  // flows
  bindFlows(container)

  // other
  container
    .bind<IHttpTransport>(HttpTransportSymbol)
    .toDynamicValue(() => new HttpTransport(console, '', () => null))
    .whenTargetIsDefault()
  container
    .bind<IHttpTransport>(HttpTransportSymbol)
    .toDynamicValue(() => {
      const config = container.get<IConfig>(ConfigSymbol)
      const authStore = container.get<IAuthStore>(AuthStoreSymbol)
      const pinStore = container.get<IPINStore>(PINStoreSymbol)
      const userStore = container.get<IUserStore>(UserStoreSymbol)

      return new NeobankHttpTransport(config, authStore, pinStore, userStore)
    })
    .whenTargetNamed('neobank')

  // native modules
  container.bind<IBuildInfoNativeModule>(BuildInfoNativeModuleSymbol).to(BuildInfoNativeModule)

  //
  container.bind<IAuthContext>(AuthContextSymbol).to(AuthContext).inSingletonScope()
}

function bindServices(container: Container) {
  container.bind<INavigationService<{}>>(NavigationServiceSymbol).to(NavigationService)
  container.bind<IToastService>(ToastServiceSymbol).to(ToastService)
  container.bind<IMonitoringService>(AppMonitoringServiceSymbol).toDynamicValue(({ currentRequest }) => {
    const config = container.get<IMonitoringConfig>(MonitoringConfigSymbol)
    const name = currentRequest.target.getNamedTag()?.value ?? 'Global' //target.name.value() ?? 'Global'
    const userStore = container.get<IUserStore>(UserStoreSymbol)

    if (__DEV__) {
      return new ConsoleMonitoringService(name)
    }

    switch (config.type) {
      case MonitoringType.Sentry:
        return new SentryService(name, config, userStore)
      case MonitoringType.Console:
      default:
        return new ConsoleMonitoringService(name)
    }
  })
  container.bind<IApiService>(ApiServiceSymbol).to(ApiService)
  container.bind<ILinkService>(LinkServiceSymbol).to(LinkService)
  container.bind<IFinanceService>(FinanceServiceSymbol).to(FinanceService)
  container.bind<IUserService>(UserServiceSymbol).to(UserService)
  container.bind<ISupportService>(SupportServiceSymbol).to(SupportService)
  container.bind<ISecureStorage>(SecureStorageSymbol).to(SecureStorage)
  container
    .bind<IAnalyticsImplementation>(AnalyticsImplementationSymbol)
    .toDynamicValue(() => {
      const config = container.get<IAnalyticsConfig>(IAnalyticsConfigSymbol)

      if (__DEV__) {
        return container.resolve<IAnalyticsImplementation>(ConsoleAnalyticsService)
      }

      switch (config.type) {
        case AnalyticsType.Amplitude:
          return container.resolve<IAnalyticsImplementation>(AmplitudeService)
        default:
          return container.resolve<IAnalyticsImplementation>(ConsoleAnalyticsService)
      }
    })
    .inSingletonScope()
  container.bind<IAnalyticsService>(AnalyticsServiceSymbol).to(AnalyticsService).inSingletonScope()

  container
    .bind<ICampaignTrackingService>(CampaignTrackingServiceSymbol)
    .toDynamicValue(() => {
      const config = container.get<IFacebookSDKConfig>(FacebookSDKConfigSymbol)

      if (!config.trackingFeature) {
        return new NoCampaignTrackingService()
      }

      const monitoring = container.getAllNamed<IMonitoringService>(
        AppMonitoringServiceSymbol,
        'CampaignTrackingService',
      )[0]

      const persistCampaign = container.getAllNamed<ICampaignPersistenceService>(
        CampaignPersistenceServiceSymbol,
        'CampaignTrackingService',
      )[0]

      return new CampaignTrackingService(config, persistCampaign, monitoring)
    })
    .inSingletonScope()
  container.bind<ICampaignPersistenceService>(CampaignPersistenceServiceSymbol).to(CampaignPersistenceService)

  container.bind<IOrderService>(OrderServiceSymbol).to(OrderService)
  container.bind<IHapticService>(HapticServiceSymbol).to(HapticService)
  container.bind<IInitialPushService>(InitialPushServiceSymbol).to(InitialPushService)
  container.bind<ILatestUnseenRewardService>(LatestUnseenRewardServiceSymbol).to(LatestUnseenRewardService)
  container.bind<IGeoService>(GeoServiceSymbol).to(GeoService)
  container.bind<ISumsubService>(SumsubServiceSymbol).to(SumsubService)
  container.bind<ISupportChatService>(SupportChatServiceSymbol).to(SupportChatService)
  container.bind<IWaitlistService>(WaitlistServiceSymbol).to(WaitlistService)
  container.bind(FeatureAccessFactorySymbol).toFactory(({ container }) => createFeatureAccessFactory(container))

  // has inner state
  container.bind<IWalletService>(WalletServiceSymbol).to(WalletService).inSingletonScope()
  container.bind<IActivityService>(ActivityServiceSymbol).to(ActivityService).inSingletonScope()
  container.bind<IActivityUtilsService>(ActivityUtilsServiceSymbol).to(ActivityUtilsService).inSingletonScope()
  container.bind<IWizardService>(WizardServiceSymbol).to(WizardService).inSingletonScope()
  container.bind<IDeviceService>(DeviceServiceSymbol).to(DeviceService).inSingletonScope()
  container.bind<IPINService>(PINServiceSymbol).to(PINService).inSingletonScope()
  container.bind<ISplashService>(SplashServiceSymbol).to(SplashService).inSingletonScope()
  container.bind<IPushNotificationService>(PushNotificationServiceSymbol).to(PushNotificationService).inSingletonScope()
  container.bind<IReferralService>(ReferralServiceSymbol).to(ReferralService).inSingletonScope()
  container.bind<IRewardService>(RewardServiceSymbol).to(RewardService).inSingletonScope()

  container.bind<ILevelService>(LevelServiceSymbol).to(LevelService).inSingletonScope()
  container.bind<ILevelOneService>(LevelOneServiceSymbol).to(LevelOneService).inSingletonScope()
  container.bind<ILevelTwoService>(LevelTwoServiceSymbol).to(LevelTwoService).inSingletonScope()
  container.bind<ILevelFlowService>(LevelFlowServiceSymbol).to(LevelFlowService).inSingletonScope()

  container.bind<IRemoteConfigService>(RemoteConfigServiceSymbol).to(RemoteConfigService).inSingletonScope()
  container.bind<ICardService>(CardServiceSymbol).to(CardService).inSingletonScope()
  container.bind<IOnChainService>(OnChainServiceSymbol).to(OnChainService).inSingletonScope()

  container.bind<ILockService>(LockServiceSymbol).to(LockService).inSingletonScope()
  container.bind<ILotteryService>(LotteryServiceSymbol).to(LotteryService).inSingletonScope()
}

function bindStores(container: Container) {
  container.bind<IAuthStore>(AuthStoreSymbol).to(AuthStore).inSingletonScope()
  container.bind<IUserStore>(UserStoreSymbol).to(UserStore).inSingletonScope()
  container.bind<IInvitationStore>(InvitationStoreSymbol).to(InvitationStore).inSingletonScope()
  container.bind<IFinanceStore>(FinanceStoreSymbol).to(FinanceStore).inSingletonScope()
  container.bind<IAppConfigStore>(AppConfigStoreSymbol).to(AppConfigStore).inSingletonScope()
  container.bind<IActivityStore>(ActivityStoreSymbol).to(ActivityStore).inSingletonScope()
  container.bind<IPreferenceStore>(PreferenceStoreSymbol).to(PreferenceStore).inSingletonScope()
  container.bind<IPINStore>(PINStoreSymbol).to(PINStore).inSingletonScope()
  container.bind<IDeviceStore>(DeviceStoreSymbol).to(DeviceStore).inSingletonScope()
  container.bind<IWalletStore>(WalletStoreSymbol).to(WalletStore).inSingletonScope()
  container.bind<IPushStore>(PushStoreSymbol).to(PushStore).inSingletonScope()
  container.bind<IOrdersStore>(OrdersStoreSymbol).to(OrdersStore).inSingletonScope()
  container.bind<ICurrentOrderStore>(CurrentOrderStoreSymbol).to(CurrentOrderStore).inSingletonScope()
  container.bind<ISupportStore>(SupportStoreSymbol).to(SupportStore).inSingletonScope()
  container.bind<IReferralStore>(ReferralStoreSymbol).to(ReferralStore).inSingletonScope()
  container.bind<ISignUpStore>(SignUpStoreSymbol).to(SignUpStore).inSingletonScope()
  container.bind<ILevelStore>(LevelStoreSymbol).to(LevelStore).inSingletonScope()
  container.bind<IVirtualCardStore>(VirtualCardStoreSymbol).to(VirtualCardStore).inSingletonScope()
  container.bind<IOnChainStore>(OnChainStoreSymbol).to(OnChainStore).inSingletonScope()
  container.bind<IRewardStore>(RewardStoreSymbol).to(RewardStore).inSingletonScope()
  container.bind<ILockStore>(LockStoreSymbol).to(LockStore).inSingletonScope()
  container.bind<ILotteryStore>(LotteryStoreSymbol).to(LotteryStore).inSingletonScope()
}

function bindFlows(container: Container) {
  container.bind<IOneTimeActionFlow>(OneTimeActionFlowSymbol).to(OneTimeActionFlow)
  container.bind<IAppOpenedFlow>(AppOpenedFlowSymbol).to(AppOpenedFlow)
}

const iocConfig = { configure }
export default iocConfig
