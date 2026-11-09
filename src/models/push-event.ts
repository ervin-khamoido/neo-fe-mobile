import { readable } from '@ts-awesome/model-reader'
import { RemoteConfig } from '../services/remote-config.service'

export enum RemoteNotificationDataType {
  OrderReward = 'order.reward',
  RemoteConfig = 'app-config.remote-config',
}

export interface IPushRewardData {
  type: RemoteNotificationDataType.OrderReward
  version: 'v1'
  order: string // Order UID
}

export interface IPushRemoteConfigData {
  type: RemoteNotificationDataType.RemoteConfig
  version: 'v1'
  keys: string // comma separated list of RewardConfig keys
}

interface ICommonPushData {
  showOnForeground?: 'true' | 'false'
}

export type PushData = (IPushRewardData | IPushRemoteConfigData) & ICommonPushData
