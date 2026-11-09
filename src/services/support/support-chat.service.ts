import { Freshchat, FreshchatConfig, FreshchatUser } from 'react-native-freshchat-sdk'
import { inject, injectable, named } from 'inversify'
import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { FreshchatConfigSymbol, IFreshchatConfig } from '../../models/config/freshchat.config'
import { ApiServiceSymbol, IApiService } from '../api.service'
import { UserFreshchatOutput } from '../../models/user-freshchat'
import { IPushStore, PushStoreSymbol } from '../store/push.store'
import { reaction } from 'mobx'
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging'
import { ISupportStore, SupportStoreSymbol } from '../store/support.store'

export interface ISupportChatService {
  initialize(): Promise<void>

  syncUser(): Promise<void>
  setUserMeta(payload: Record<string, string | number | boolean>): Promise<void>
  resetUser(): Promise<void>

  showConversations(): Promise<void>

  processFreshchatPush(notification: FirebaseMessagingTypes.RemoteMessage): Promise<boolean>
  syncFreshchatUnreadCount(): Promise<void>
}

export const SupportChatServiceSymbol = Symbol.for('ISupportChatService')

@injectable()
export class SupportChatService implements ISupportChatService {
  @inject(FreshchatConfigSymbol) freshchatConfig!: IFreshchatConfig

  @inject(AppMonitoringServiceSymbol) @named('SupportChatService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PushStoreSymbol) pushStore!: IPushStore
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  async initialize(): Promise<void> {
    const freshchatConfig = new FreshchatConfig(this.freshchatConfig.appId, this.freshchatConfig.appKey)
    freshchatConfig.domain = this.freshchatConfig.domain

    // freshchatConfig.teamMemberInfoVisible = true;
    // freshchatConfig.cameraCaptureEnabled = true;
    // freshchatConfig.gallerySelectionEnabled = true;
    // freshchatConfig.responseExpectationEnabled = true;
    // freshchatConfig.showNotificationBanner = true; //iOS only
    // freshchatConfig.notificationSoundEnabled = true; //iOS only
    // freshchatConfig.themeName = "CustomTheme.plist"; //iOS only
    // freshchatConfig.stringsBundle = "FCCustomLocalizable"; //iOS only

    Freshchat.init(freshchatConfig)

    Freshchat.addEventListener(Freshchat.EVENT_USER_RESTORE_ID_GENERATED, () => {
      Freshchat.getUser(user => this.updateUserRestoreId(user.restoreId))
    })

    Freshchat.addEventListener(Freshchat.EVENT_UNREAD_MESSAGE_COUNT_CHANGED, async () => {
      await this.syncFreshchatUnreadCount()
    })

    reaction(
      () => this.pushStore.token,
      async () => {
        const apnsToken = await messaging().getAPNSToken()
        if (apnsToken) {
          Freshchat.setPushRegistrationToken(apnsToken)
        }
      },
    )
  }

  async syncUser(): Promise<void> {
    const { me } = this.userStore

    let result: UserFreshchatOutput = {
      externalId: this.userStore.me.uid,
      phone: me.phone,
      email: me.email,
      firstName: me.userDetails?.fullName,
    }
    try {
      result = await this.api.withAuth(h => h.get('/api/v1/support/me/freshchat', { Model: UserFreshchatOutput }))
    } catch (err) {
      this.monitoring.exception(err)
    }

    const { externalId, restoreId, firstName, lastName, phone, email, meta } = result

    const freshchatUser = new FreshchatUser()
    freshchatUser.firstName = firstName
    freshchatUser.email = lastName
    freshchatUser.phone = phone
    freshchatUser.email = email

    Freshchat.identifyUser(externalId, restoreId, error => {
      this.monitoring.exception(error)
    })

    Freshchat.setUser(freshchatUser, error => {
      this.monitoring.exception(error)
    })

    if (meta) {
      await this.setUserMeta(meta)
    }
  }

  async setUserMeta(payload: Record<string, string | number | boolean>): Promise<void> {
    Freshchat.setUserProperties(payload, error => {
      this.monitoring.exception(error)
    })
  }

  async resetUser(): Promise<void> {
    Freshchat.resetUser()
  }

  async showConversations(): Promise<void> {
    Freshchat.showConversations()
  }

  async processFreshchatPush(notification: FirebaseMessagingTypes.RemoteMessage): Promise<boolean> {
    return new Promise(resolve => {
      Freshchat.isFreshchatNotification(notification, freshchatNotification => {
        if (freshchatNotification) {
          Freshchat.handlePushNotification(notification)
          resolve(true)
        } else {
          resolve(false)
        }
      })
    })
  }

  async syncFreshchatUnreadCount(): Promise<void> {
    type UnreadCountInfo = { count: number; status: boolean }

    const result = await new Promise<UnreadCountInfo>(resolve => {
      Freshchat.getUnreadCountAsync(data => resolve(data))
    })

    this.supportStore.setFreshchatUnreadCount(result.count)
  }

  private async updateUserRestoreId(restoreId: string): Promise<void> {
    if (!restoreId) {
      return
    }

    try {
      await this.api.withAuth(h => h.post('/api/v1/support/me/freshchat', { body: { restoreId } }))
    } catch (err) {
      this.monitoring.exception(err)
    }
  }
}
