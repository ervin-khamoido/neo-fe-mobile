import { inject, injectable, named } from 'inversify'
import { Platform } from 'react-native'
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { getDeviceId } from 'react-native-device-info'
import notifee, { Notification } from '@notifee/react-native'
import { reaction } from 'mobx'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { ApiServiceSymbol, IApiService } from '../api.service'
import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { IPushStore, PushStoreSymbol } from '../store/push.store'
import { PushData } from '../../models/push-event'
import { ISupportChatService, SupportChatServiceSymbol } from '../support/support-chat.service'
import { ISupportStore, SupportStoreSymbol } from '../store/support.store'

export interface IPushNotificationService {
  initialize(): Promise<void>
  dispose(): Promise<void>

  requestPermission(): Promise<void>

  syncInitialNotification(): Promise<void>

  pushSignUpNotification(): Promise<void>
  pushLocalNotification(notifications: Notification): Promise<void>
}

export const PushNotificationServiceSymbol = Symbol.for('IPushNotificationService')

// Register background handler
// The handler must return a promise once your logic has completed to free up
// device resources. It must not attempt to update any UI (e.g. via state) -
// you can however perform network requests, update local storage etc.

messaging().setBackgroundMessageHandler(async remoteMessage => {
  // should be set to handle opening the app via push when the app in background
})

@injectable()
export class PushNotificationService implements IPushNotificationService {
  @inject(AppMonitoringServiceSymbol) @named('PushNotificationService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(SupportChatServiceSymbol) supportChatService!: ISupportChatService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PushStoreSymbol) pushStore!: IPushStore
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  private disposeBag: (() => void)[] = []
  private androidDefaultChannel: string | null = null

  async initialize() {
    let disposer = messaging().onMessage(x => this.handleForegroundNotification(x))
    this.disposeBag.push(disposer)

    // it doesn't work with notifications pushed through APNS
    // https://github.com/invertase/react-native-firebase/issues/5002#issuecomment-905898084
    // please see PushNotificationService->syncInitialNotification() for an alternative solution
    //
    // disposer = messaging().onNotificationOpenedApp(x => this.handleNotificationOpenedApp(x))
    // this.disposeBag.push(disposer)

    this.androidDefaultChannel = await notifee.createChannel({
      id: 'default',
      name: 'Default Neobank Channel',
    })

    await messaging().subscribeToTopic('all')

    reaction(
      () => this.userStore.me,
      async user => {
        if (user) {
          await this.subscribeCurrentDevice()
        } else {
          await this.unsubscribeCurrentDevice()
        }
      },
    )

    reaction(
      () => this.supportStore.freshchatUnreadCount,
      () => {
        notifee.setBadgeCount(this.supportStore.freshchatUnreadCount).catch(ignore => {})
      },
    )
  }

  async dispose() {
    for (const item of this.disposeBag) {
      item()
    }
    this.disposeBag = []
  }

  async subscribeCurrentDevice(): Promise<void> {
    await this.requestPermission()

    const { pushEnabled } = this.pushStore
    if (!pushEnabled) {
      return
    }

    const { me } = this.userStore
    if (!me) {
      this.monitoring.exception('Unable to subscribe current device if me is null')
      return
    }

    let token: string | null = null
    try {
      token = await messaging().getToken()

      if (!token) {
        this.monitoring.exception(`unable to get user's token for user UID ${me.uid}`)
        return
      }
    } catch (err) {
      this.monitoring.exception(err)
      return
    }

    this.pushStore.setPushToken(token)

    const body = {
      platform: Platform.OS,
      device: getDeviceId(),
      token,
    }

    try {
      await this.api.withAuth(http => http.post('/api/v1/user/push/subscribe', { body }))
    } catch (err) {
      this.monitoring.exception(err)
    }
  }

  async unsubscribeCurrentDevice(): Promise<void> {
    const { me } = this.userStore

    if (!me) {
      this.monitoring.exception('Unable to unsubscribe current device if me is null')
      return
    }

    let token: string | null = null
    try {
      token = await messaging().getToken()

      if (!token) {
        this.monitoring.exception(`unable to get user's token for user UID ${me.uid}`)
        return
      }
    } catch (err) {
      this.monitoring.exception(err)
      return
    }

    const body = { token }

    try {
      await this.api.withAuth(http => http.post('/api/v1/user/push/unsubscribe', { body }))
    } catch (err) {
      this.monitoring.exception(err)
    }
  }

  async syncPermission(): Promise<void> {
    const authStatus = await messaging().hasPermission()

    const enabled = isPushEnabled(authStatus)

    this.pushStore.setPushEnabled(enabled)
  }

  async requestPermission(): Promise<void> {
    const authStatus = await messaging().requestPermission()
    const enabled = isPushEnabled(authStatus)

    this.pushStore.setPushEnabled(enabled)
  }

  async syncInitialNotification(): Promise<void> {
    try {
      const notification = await messaging().getInitialNotification()

      if (!notification) {
        return
      }

      this.pushStore.setNotificationOpenedApp(notification.data as any)
    } catch (err: any) {
      this.monitoring.exception(err)
    }
  }

  async pushSignUpNotification(): Promise<void> {
    await notifee.displayNotification({
      title: '💰Welcome to Neobank! Start saving today',
      body: 'Welcome onboard! You can now save in digital dollars and protect yourself (and your family) from inflation. Let’s get started.',
      android: {
        channelId: this.androidDefaultChannel,
        smallIcon: 'ic_stat_name',
        pressAction: { id: 'default' },
      },
    })
  }

  async pushLocalNotification(notifications: Notification): Promise<void> {
    await notifee.displayNotification({
      android: {
        channelId: this.androidDefaultChannel,
        smallIcon: 'ic_stat_name',
        pressAction: { id: 'default' },
      },
      ...notifications,
    })
  }

  private async handleForegroundNotification(message: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    const isProcessed = await this.supportChatService.processFreshchatPush(message)
    if (isProcessed) {
      return
    }

    const { data = <any>{}, notification } = message

    const { showOnForeground = 'true' } = data as PushData

    // according to firebase typing data has to contain string
    const hasNotificationContent = notification?.title && notification?.body
    if (showOnForeground === 'true' && hasNotificationContent) {
      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId: this.androidDefaultChannel,
          smallIcon: 'ic_stat_name',
          pressAction: { id: 'default' },
        },
      })
    }

    this.pushStore.pushForegroundNotifications(data)
  }
}

function isPushEnabled(status: FirebaseMessagingTypes.AuthorizationStatus): boolean {
  return status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL
}
