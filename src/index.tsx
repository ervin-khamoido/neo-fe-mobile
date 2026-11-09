import React, { memo, useCallback, useEffect, useState } from 'react'
import { StatusBar, StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { Container } from 'inversify'
import Toast from 'react-native-toast-notifications'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as Sentry from '@sentry/react-native'

import appCheck from '@react-native-firebase/app-check'

import ioc from './ioc'
import iocConfig from './ioc/root.scope'

import { InitialScreen } from './screen/initial.screen'
import { AppMonitoringServiceSymbol, IMonitoringService } from './services/monitoring.service'
import { ILinkService, LinkServiceSymbol } from './services/link.service'
import { colors } from './common/constrants'
import { DeviceServiceSymbol, IDeviceService } from './services/device.service'
import { IPushNotificationService, PushNotificationServiceSymbol } from './services/push/push-notification.service'
import {
  CampaignTrackingServiceSymbol,
  ICampaignTrackingService,
} from './services/analytics/campaign-analytics.service'
import { IAuthContext } from './services/context/auth/interfaces'
import { AuthContextSymbol } from './services/context/auth'
import { IRemoteConfigService, RemoteConfigServiceSymbol } from './services/remote-config.service'
import { ActivityServiceSymbol, IActivityService } from './services/activity/activity.service'
import { IWalletService, WalletServiceSymbol } from './services/wallet.service'
import { ILevelService, LevelServiceSymbol } from './services/level/level.service'
import { IOnChainService, OnChainServiceSymbol } from './services/on-chain.service'
import { CardServiceSymbol, ICardService } from './services/card.service'
import { ISupportChatService, SupportChatServiceSymbol } from './services/support/support-chat.service'
import { IWaitlistService, WaitlistServiceSymbol } from './services/waitlist.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from './services/analytics/analytics.service'
import { ILockService, LockServiceSymbol } from './services/lock.service'
import { ILotteryService, LotteryServiceSymbol } from './services/lottery.service'
import { SafeAreaProvider } from 'react-native-safe-area-context'

async function bootstrap(): Promise<void> {
  const container = new Container()
  ioc.setContainer(container)

  await iocConfig.configure(container)

  // Firebase
  await appCheck().activate('', true)

  // > subscribe for push notification events from Firebase
  const pushNotifications = container.get<IPushNotificationService>(PushNotificationServiceSymbol)
  await pushNotifications.initialize().catch(() => {})

  const remoteConfigService = container.get<IRemoteConfigService>(RemoteConfigServiceSymbol)
  await remoteConfigService.initialize()

  // > activate remote configs
  await remoteConfigService.syncConfig()
  remoteConfigService.activateAllConfig()

  // > subscribe for firestore events
  const activityService = container.get<IActivityService>(ActivityServiceSymbol)
  const walletService = container.get<IWalletService>(WalletServiceSymbol)
  const levelService = container.get<ILevelService>(LevelServiceSymbol)
  const onChainService = container.get<IOnChainService>(OnChainServiceSymbol)
  const cardService = container.get<ICardService>(CardServiceSymbol)
  const waitlistService = container.get<IWaitlistService>(WaitlistServiceSymbol)
  const lockService = container.get<ILockService>(LockServiceSymbol)
  const lotteryService = container.get<ILotteryService>(LotteryServiceSymbol)

  activityService.initialize()
  walletService.initialize()
  levelService.initialize()
  onChainService.initialize()
  cardService.initialize()
  waitlistService.initialize()
  lockService.initialize()
  lotteryService.initialize()

  // initialize Sentry sdk
  const monitoring = container.get<IMonitoringService>(AppMonitoringServiceSymbol)
  monitoring.initialize()

  // initialize deep linking sdk
  const linkService = container.get<ILinkService>(LinkServiceSymbol)
  await linkService.initialize()

  // subscribe for device events
  const deviceService = container.get<IDeviceService>(DeviceServiceSymbol)
  await deviceService.initialize()
  await deviceService.syncBuildInfo()

  // initialize analytics sdk
  const analyticsService = container.get<IAnalyticsService>(AnalyticsServiceSymbol)
  await analyticsService.initialize()
  analyticsService.openScreen(AnalyticsFlow.Auth, AnalyticsScreen.Splash)

  // initialize facebook sdk
  const facebookAnalyticsService = container.get<ICampaignTrackingService>(CampaignTrackingServiceSymbol)
  facebookAnalyticsService.init()

  // subscribe the auth context for all required events
  const authContext = container.get<IAuthContext>(AuthContextSymbol)
  authContext.initialize()

  // support
  const supportChatService = container.get<ISupportChatService>(SupportChatServiceSymbol)
  await supportChatService.initialize()
}

const _NeobankApp = memo(() => {
  const [ready, setReady] = useState(false)
  const [navigatorReady, setNavigatorReady] = useState(false)
  const [toastReady, setToastReady] = useState(false)

  const onNavigatorRef = useCallback(navigatorContainer => {
    ioc.bindNavigator(navigatorContainer)
  }, [])
  const onNavigatorReady = useCallback(() => {
    setNavigatorReady(true)
  }, [setNavigatorReady])
  const onToastRef = useCallback(toast => {
    ioc.bindToast(toast)
    setToastReady(true)
  }, [])

  useEffect(() => {
    bootstrap().then(() => setReady(true))
  }, [setReady])

  if (!ready) {
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <NavigationContainer onReady={onNavigatorReady} ref={onNavigatorRef}>
          {toastReady && navigatorReady && <InitialScreen />}
        </NavigationContainer>
        <Toast ref={onToastRef} offsetTop={50} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
})

export const NeobankApp = Sentry.wrap(_NeobankApp)

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
})
