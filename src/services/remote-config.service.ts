2021

import { inject, injectable } from 'inversify'

import remoteConfig from '@react-native-firebase/remote-config'
import { AppConfigStoreSymbol, IAppConfigStore } from './store/app-config.store'
import { IPushStore, PushStoreSymbol } from './store/push.store'
import { reaction } from 'mobx'
import { IPushRemoteConfigData, RemoteNotificationDataType } from '../models/push-event'

export interface IRemoteConfigService {
  initialize(): Promise<void>
  syncConfig(): Promise<void>

  activateAllConfig(): void
}

export const RemoteConfigServiceSymbol = Symbol.for('IRemoteConfigService')

@injectable()
export class RemoteConfigService implements IRemoteConfigService {
  private static retryTimeout: number | NodeJS.Timeout | null = null

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(PushStoreSymbol) pushStore!: IPushStore

  async initialize(): Promise<void> {
    const defaults: Record<RemoteConfig, string | number | boolean> = {
      [RemoteConfig.SkipUpdateAppAlert]: false,

      [RemoteConfig.ShowHolidayBanner]: false,
      [RemoteConfig.DepositLocks]: false,

      [RemoteConfig.SendOffChain]: false,
      [RemoteConfig.SendUsBankAccount]: false,

      [RemoteConfig.VirtualCard]: false,
      [RemoteConfig.VirtualCardWaitlist]: true,

      [RemoteConfig.ReceiveOnChain]: false,
      [RemoteConfig.ReceiveOnChainWaitlist]: true,

      [RemoteConfig.SendOnChain]: false,
      [RemoteConfig.SendOnChainWaitlist]: true,

      [RemoteConfig.MinSupportedAppVersion]: '0.0.0',
      [RemoteConfig.RewardCenter]: false,
      [RemoteConfig.NeobankAppSaturday]: false,
      [RemoteConfig.SupportInAppChat]: false,
      [RemoteConfig.PhoneVerificationWhatsapp]: false,
    }

    this.appConfigStore.mergeRemoteConfig(defaults)
    await remoteConfig().setDefaults(defaults)

    reaction(
      () => this.pushStore.foregroundNotificationData,
      () => this.onPushNotification(),
    )
  }

  async syncConfig(): Promise<void> {
    try {
      await this.fetchAndActivate(FETCH_CACHE_TIMEOUT)

      if (RemoteConfigService.retryTimeout) {
        clearTimeout(RemoteConfigService.retryTimeout)
        RemoteConfigService.retryTimeout = null
      }
    } catch (err) {
      if (!RemoteConfigService.retryTimeout) {
        RemoteConfigService.retryTimeout = setTimeout(() => this.syncConfig(), FETCH_RETRY_INTERVAL)
      }
    }
  }

  activateAllConfig(): void {
    const configs = this.mapConfigsFromFirebase()

    this.appConfigStore.mergeRemoteConfig(configs)
  }

  activateConfigsByKeys(keys: RemoteConfig[]): void {
    const configs = this.mapConfigsFromFirebase()

    for (const configKey in configs) {
      if (!keys.includes(configKey as RemoteConfig)) {
        delete configs[configKey]
      }
    }

    this.appConfigStore.mergeRemoteConfig(configs)
  }

  private mapConfigsFromFirebase(): Record<RemoteConfig, string | number | boolean> {
    return {
      [RemoteConfig.SkipUpdateAppAlert]: remoteConfig().getValue(RemoteConfig.SkipUpdateAppAlert).asBoolean(),

      [RemoteConfig.ShowHolidayBanner]: remoteConfig().getValue(RemoteConfig.ShowHolidayBanner).asBoolean(),

      [RemoteConfig.DepositLocks]: remoteConfig().getValue(RemoteConfig.DepositLocks).asBoolean(),

      [RemoteConfig.SendOffChain]: remoteConfig().getValue(RemoteConfig.SendOffChain).asBoolean(),
      [RemoteConfig.SendUsBankAccount]: remoteConfig().getValue(RemoteConfig.SendUsBankAccount).asBoolean(),

      [RemoteConfig.VirtualCard]: remoteConfig().getValue(RemoteConfig.VirtualCard).asBoolean(),
      [RemoteConfig.VirtualCardWaitlist]: remoteConfig().getValue(RemoteConfig.VirtualCardWaitlist).asBoolean(),

      [RemoteConfig.ReceiveOnChain]: remoteConfig().getValue(RemoteConfig.ReceiveOnChain).asBoolean(),
      [RemoteConfig.ReceiveOnChainWaitlist]: remoteConfig().getValue(RemoteConfig.ReceiveOnChainWaitlist).asBoolean(),

      [RemoteConfig.SendOnChain]: remoteConfig().getValue(RemoteConfig.SendOnChain).asBoolean(),
      [RemoteConfig.SendOnChainWaitlist]: remoteConfig().getValue(RemoteConfig.SendOnChainWaitlist).asBoolean(),

      [RemoteConfig.MinSupportedAppVersion]: remoteConfig().getValue(RemoteConfig.MinSupportedAppVersion).asString(),
      [RemoteConfig.RewardCenter]: remoteConfig().getValue(RemoteConfig.RewardCenter).asBoolean(),
      [RemoteConfig.NeobankAppSaturday]: remoteConfig().getValue(RemoteConfig.NeobankAppSaturday).asBoolean(),
      [RemoteConfig.SupportInAppChat]: remoteConfig().getValue(RemoteConfig.SupportInAppChat).asBoolean(),
      [RemoteConfig.PhoneVerificationWhatsapp]: remoteConfig()
        .getValue(RemoteConfig.PhoneVerificationWhatsapp)
        .asBoolean(),
    }
  }

  private async fetchAndActivate(expirationDurationSec: number): Promise<boolean> {
    await remoteConfig().fetch(expirationDurationSec)
    return remoteConfig().activate()
  }

  private async onPushNotification() {
    const remoteConfigPushes = this.pushStore.foregroundNotificationData.filter(
      x => x.type === RemoteNotificationDataType.RemoteConfig,
    ) as IPushRemoteConfigData[]
    if (remoteConfigPushes.length === 0) {
      return
    }

    const configKeys = remoteConfigPushes.reduce<RemoteConfig[]>((res, curr) => {
      const parsedKeys = curr.keys.split(',') as RemoteConfig[]
      res.push(...parsedKeys)

      return res
    }, [])

    try {
      await this.fetchAndActivate(0)
      this.activateConfigsByKeys(configKeys)
    } catch (err) {
      //
    }
  }
}

const FETCH_RETRY_INTERVAL = 10 * 1000
const FETCH_CACHE_TIMEOUT = 10 * 60 // 10m

export enum RemoteConfig {
  SendOffChain = 'send_off_chain',
  SendUsBankAccount = 'send_us_bank_account',

  VirtualCard = 'virtual_card',
  VirtualCardWaitlist = 'virtual_card_waitlist',

  MinSupportedAppVersion = 'min_supported_app_version',

  ReceiveOnChain = 'receive_on_chain',
  ReceiveOnChainWaitlist = 'receive_on_chain_waitlist',

  SendOnChain = 'send_on_chain',
  SendOnChainWaitlist = 'send_on_chain_waitlist',

  RewardCenter = 'reward_center',
  NeobankAppSaturday = 'neobank_app_saturday',
  SupportInAppChat = 'support_in_app_chat',
  PhoneVerificationWhatsapp = 'phone_verification_whatsapp',

  ShowHolidayBanner = 'show_holiday_banner',

  DepositLocks = 'deposit_locks',
  SkipUpdateAppAlert = 'skip_update_app_alert',
}
