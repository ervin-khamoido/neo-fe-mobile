import { inject, injectable, named } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { PushData, RemoteNotificationDataType } from '../../models/push-event'

export interface IPushStore {
  readonly pushEnabled: boolean
  readonly token: string | null
  readonly notificationOpenedAppData: PushData | null

  setPushEnabled(value: boolean): void
  setPushToken(value: string | null): void
  setNotificationOpenedApp(data: PushData)
  resetNotificationOpenedApp()

  readonly foregroundNotificationData: PushData[]

  pushForegroundNotifications(...value: PushData[]): void
  popRewardNotificationsForOrders(orders: string[]): void
  popAllNotificationsOfType(type: RemoteNotificationDataType): void
}

export const PushStoreSymbol = Symbol.for('IPushStore')

@cleanable
@injectable()
export class PushStore implements IPushStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('PushStore') monitoring!: IMonitoringService

  @observable pushEnabled: boolean
  @observable token: string | null
  @observable notificationOpenedAppData: PushData | null = null
  @observable foregroundNotificationData: PushData[] = []

  constructor() {
    makeObservable(this)
  }

  @action setPushEnabled(value: boolean): void {
    this.pushEnabled = value
  }

  @action setPushToken(value: string): void {
    this.token = value
  }

  @action setNotificationOpenedApp(data: PushData): void {
    this.notificationOpenedAppData = data
  }

  @action resetNotificationOpenedApp(): void {
    this.notificationOpenedAppData = null
  }

  @action pushForegroundNotifications(...value: PushData[]): void {
    this.foregroundNotificationData = [...this.foregroundNotificationData, ...value]
  }

  @action popForegroundNotifications(type: RemoteNotificationDataType): PushData[] {
    const result = this.foregroundNotificationData.filter(x => x.type === type)

    this.foregroundNotificationData = this.foregroundNotificationData.filter(x => x.type !== type)

    return result
  }

  @action popRewardNotificationsForOrders(orders: string[]): void {
    const condition = (x: PushData) => x.type === RemoteNotificationDataType.OrderReward && orders.includes(x.order)

    this.foregroundNotificationData = this.foregroundNotificationData.filter(x => !condition(x))
  }

  @action popAllNotificationsOfType(type: RemoteNotificationDataType): void {
    this.foregroundNotificationData = this.foregroundNotificationData.filter(x => x.type !== type)
  }

  @action clean() {
    this.pushEnabled = false
    this.token = null
    this.foregroundNotificationData = []
    this.notificationOpenedAppData = null
  }
}
