import { inject, injectable, named } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import {
  Activity,
  ActivityStatusEnum,
  ActivityType,
  CardOrderActivityStatus,
  LockOrderActivityStatus,
  OnChainOrderActivityStatus,
  PurchaseOrderActivityStatus,
  RewardOrderActivityStatus,
  SellOrderActivityStatus,
  TransferOrderActivityStatus,
  YieldOrderActivityStatus,
} from '../../models'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'

export interface IActivityStatusDefinition {
  status: ActivityStatusEnum
  name: string
  isClosed: boolean
  isVisible: boolean
}

export interface IActivityStore {
  readonly unreadCount: number

  readonly activities: Activity[]
  readonly history: Activity[]
  readonly pending: Activity[]

  readonly walletActivities: Activity[]
  readonly cardActivities: Activity[]
  readonly lockActivities: Activity[]

  readonly pendingPaymentPOs: Activity[]
  readonly pendingConfirmationSOs: Activity[]

  readonly poStatusDefinitions: IActivityStatusDefinition[]
  readonly soStatusDefinitions: IActivityStatusDefinition[]
  readonly yoStatusDefinitions: IActivityStatusDefinition[]
  readonly rewardStatusDefinitions: IActivityStatusDefinition[]
  readonly toStatusDefinitions: IActivityStatusDefinition[]

  any(): boolean
  push(item: Activity): void
  update(uid: string, item: Activity): void
  remove(uid: string): void
  getOne(uid: string): Activity | null
  getMany(uids: string[]): Activity[]
  getByOrder(order: string): Activity | null
  getManyByOrder(orders: string[]): Activity[]

  readonly latestUnseenReward: Activity | null
  setLatestUnseenReward(value: Activity): void
  resetLatestUnseenReward(): void
}

export const ActivityStoreSymbol = Symbol.for('IActivityStore')

@cleanable
@injectable()
export class ActivityStore implements IActivityStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('ActivityStore') monitoring!: IMonitoringService

  @computed get unreadCount() {
    return 0
  }

  @computed get history() {
    let historyActivities = []

    for (const item of this._activities) {
      const activityType = item.type
      switch (activityType) {
        case ActivityType.Buy: {
          const statusDefinition = this.poStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Sell: {
          const statusDefinition = this.soStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Yield: {
          const statusDefinition = this.yoStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Reward: {
          const statusDefinition = this.rewardStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Transfer_Send:
        case ActivityType.Transfer_Receive: {
          const statusDefinition = this.toStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Card: {
          const statusDefinition = this.coStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.OnChain: {
          const statusDefinition = this.ocoStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        case ActivityType.Lock: {
          const statusDefinition = this.loStatusDefinitions.find(x => x.status === item.status)
          if (statusDefinition?.isClosed) {
            historyActivities.push(item)
          }
          break
        }
        default:
          this.monitoring.exception(`get history()->map(): unknown activity type: ${activityType}`)
      }
    }

    return this.sort(historyActivities) //not pending
  }

  @computed get pending() {
    //TODO: refactor
    return this.sort(this._activities.filter(a => !this.history.includes(a)))
  }

  @computed get activities() {
    return this.sort([...this._activities])
  }

  @computed get cardActivities() {
    return this.activities.filter(x => x.type === ActivityType.Card)
  }

  @computed get walletActivities() {
    return this.activities.filter(x => ![ActivityType.Card].includes(x.type))
  }

  @computed get lockActivities() {
    return this.activities.filter(x => x.type === ActivityType.Lock)
  }

  @computed get pendingPaymentPOs() {
    const filteredActivities = this.activities.filter(
      x => x.status === PurchaseOrderActivityStatus.NewPurchase && x.type === ActivityType.Buy,
    )

    return this.sort(filteredActivities)
  }

  @computed get pendingConfirmationSOs() {
    const filteredActivities = this.activities.filter(
      x => x.status === SellOrderActivityStatus.TransferSuccessful && x.type === ActivityType.Sell,
    )

    return this.sort(filteredActivities)
  }

  @computed get poStatusDefinitions() {
    return this._poStatusDefinitions
  }

  @computed get soStatusDefinitions() {
    return this._soStatusDefinitions
  }

  @computed get yoStatusDefinitions() {
    return this._yoStatusDefinitions
  }

  @computed get rewardStatusDefinitions() {
    return this._rewardStatusDefinitions
  }

  @computed get toStatusDefinitions() {
    return this._toStatusDefinitions
  }

  @computed get coStatusDefinitions() {
    return this._coStatusDefinitions
  }

  @computed get ocoStatusDefinitions() {
    return this._ocoStatusDefinitions
  }

  @computed get loStatusDefinitions() {
    return this._loStatusDefinitions
  }

  @observable _activities: Activity[] = []

  @observable readonly _poStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Order Placed', status: PurchaseOrderActivityStatus.NewPurchase, isClosed: false, isVisible: true },
    { name: 'Payment Sent', status: PurchaseOrderActivityStatus.PaymentSent, isClosed: false, isVisible: true },
    {
      name: 'Confirming Payment',
      status: PurchaseOrderActivityStatus.ConfirmingPayment,
      isClosed: false,
      isVisible: true,
    },
    {
      name: 'Payment Confirmed',
      status: PurchaseOrderActivityStatus.PaymentConfirmed,
      isClosed: false,
      isVisible: true,
    },
    {
      name: 'Converting to USDC',
      status: PurchaseOrderActivityStatus.ConvertingToUSDC,
      isClosed: false,
      isVisible: true,
    },
    { name: 'USDC Deposited', status: PurchaseOrderActivityStatus.USDCDeposited, isClosed: true, isVisible: true },
    { name: 'Cancelled', status: PurchaseOrderActivityStatus.Cancelled, isClosed: true, isVisible: true },
    {
      name: 'Payment Not Received',
      status: PurchaseOrderActivityStatus.PaymentNotReceived,
      isClosed: true,
      isVisible: true,
    },
    { name: 'Refunded', status: PurchaseOrderActivityStatus.Refunded, isClosed: true, isVisible: true },
  ]

  @observable readonly _soStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Order Placed', status: SellOrderActivityStatus.OrderPlaced, isClosed: false, isVisible: true },
    { name: 'Withdrawing USDC', status: SellOrderActivityStatus.WithdrawingUSDC, isClosed: false, isVisible: true },
    { name: 'Converting USDC', status: SellOrderActivityStatus.ConvertingUSDC, isClosed: false, isVisible: true },
    { name: 'Transferring NGN', status: SellOrderActivityStatus.TransferringNGN, isClosed: false, isVisible: true },
    {
      name: 'Transfer Successful',
      status: SellOrderActivityStatus.TransferSuccessful,
      isClosed: false,
      isVisible: true,
    },
    { name: 'Refunding USDC', status: SellOrderActivityStatus.RefundingUSDC, isClosed: false, isVisible: false },
    { name: 'Completed', status: SellOrderActivityStatus.Completed, isClosed: true, isVisible: true },
    { name: 'Cancelled', status: SellOrderActivityStatus.Cancelled, isClosed: true, isVisible: true },
  ]

  @observable readonly _yoStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Completed', status: YieldOrderActivityStatus.Completed, isClosed: true, isVisible: true },
  ]

  @observable readonly _rewardStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Completed', status: RewardOrderActivityStatus.Completed, isClosed: true, isVisible: true },
  ]

  @observable readonly _toStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Completed', status: TransferOrderActivityStatus.Completed, isClosed: true, isVisible: true },
    { name: 'Failed', status: TransferOrderActivityStatus.Failed, isClosed: true, isVisible: true },
  ]

  @observable readonly _coStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Pending', status: CardOrderActivityStatus.Pending, isClosed: false, isVisible: true },
    { name: 'Completed', status: CardOrderActivityStatus.Completed, isClosed: true, isVisible: true },
    { name: 'Failed', status: CardOrderActivityStatus.Failed, isClosed: true, isVisible: true },
  ]

  @observable readonly _ocoStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Pending', status: OnChainOrderActivityStatus.Pending, isClosed: false, isVisible: true },
    { name: 'Completed', status: OnChainOrderActivityStatus.Completed, isClosed: true, isVisible: true },
    { name: 'Failed', status: OnChainOrderActivityStatus.Failed, isClosed: true, isVisible: true },
    { name: 'Quarantined', status: OnChainOrderActivityStatus.Quarantine, isClosed: true, isVisible: true },
  ]

  @observable readonly _loStatusDefinitions: IActivityStatusDefinition[] = [
    { name: 'Pending', status: LockOrderActivityStatus.Pending, isClosed: false, isVisible: true },
    { name: 'Completed', status: LockOrderActivityStatus.Completed, isClosed: true, isVisible: true },
    { name: 'Failed', status: LockOrderActivityStatus.Failed, isClosed: true, isVisible: true },
  ]

  @observable latestUnseenReward: Activity | null = null

  constructor() {
    makeObservable(this)
  }

  @action any(): boolean {
    return this._activities.length > 0
  }

  @action push(item: Activity): void {
    const existing = this.getOne(item.uid)

    if (existing) {
      this.update(item.uid, item)
    } else {
      this._activities.unshift(item)
    }
  }

  @action update(uid: string, item: Activity): void {
    this._activities = this._activities.map(x => (x.uid === uid ? Activity.read(item) : x))
  }

  @action remove(uid: string): void {
    this._activities = this._activities.filter(x => x.uid !== uid)
  }

  getOne(uid: string): Activity | null {
    return this._activities.find(x => x.uid === uid) ?? null
  }

  getMany(uids: string[]): Activity[] {
    return this._activities.filter(x => uids.includes(x.uid))
  }

  getByOrder(order: string): Activity | null {
    return this._activities.find(x => x.order === order)
  }

  getManyByOrder(orders: string[]): Activity[] {
    return this._activities.filter(x => orders.includes(x.order))
  }

  @action setLatestUnseenReward(value: Activity): void {
    this.latestUnseenReward = value
  }

  @action resetLatestUnseenReward(): void {
    this.latestUnseenReward = null
  }

  private sort(activities: Activity[]): Activity[] {
    return activities.sort((a, b) => (a.createdAt >= b.createdAt ? -1 : 1))
  }

  @action clean() {
    this._activities = []
  }
}
