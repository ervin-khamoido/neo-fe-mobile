import { MainNavigatorDef } from '../common'
import {
  Activity,
  ActivityType,
  PurchaseOrderActivityStatus,
  RewardOrderActivityStatus,
  SellOrderActivityStatus,
  YieldOrderActivityStatus,
} from '../../models'

interface IActivityScreenDispatcher {
  [ActivityType.Buy]: (activity: Activity) => keyof MainNavigatorDef
  [ActivityType.Sell]: (activity: Activity) => keyof MainNavigatorDef
  [ActivityType.Yield]: (activity: Activity) => keyof MainNavigatorDef
  [ActivityType.Reward]: (activity: Activity) => keyof MainNavigatorDef
}

const activityScreenDispatcher: IActivityScreenDispatcher = Object.freeze({
  [ActivityType.Buy]: (activity: Activity) => {
    switch (activity.status) {
      case PurchaseOrderActivityStatus.PaymentNotReceived:
        return 'PaymentNotReceived'
      case PurchaseOrderActivityStatus.NewPurchase:
        return 'BankTransfer'
      case PurchaseOrderActivityStatus.USDCDeposited:
        return 'TransactionsDetails'
      case PurchaseOrderActivityStatus.Refunded:
        return 'CancelledOrder'
      case PurchaseOrderActivityStatus.Cancelled:
        return 'DummyActivityDetails'
      default:
        return 'PendingDetails'
    }
  },
  [ActivityType.Sell]: (activity: Activity) => {
    switch (activity.status) {
      case SellOrderActivityStatus.Completed:
        return 'TransactionsDetails'
      case SellOrderActivityStatus.Cancelled:
        return 'CancelledOrder'
      default:
        return 'SellOrderStatus'
    }
  },
  [ActivityType.Yield]: (activity: Activity) => {
    switch (activity.status) {
      case YieldOrderActivityStatus.Completed:
        return 'TransactionsDetails'
      default:
        return 'TransactionsDetails'
    }
  },
  [ActivityType.Reward]: (activity: Activity) => {
    switch (activity.status) {
      case RewardOrderActivityStatus.Completed:
        return 'RewardDetails'

      default:
        return 'RewardDetails'
    }
  },
  [ActivityType.Transfer_Receive]: () => 'MoneyTransferDetails',
  [ActivityType.Transfer_Send]: () => 'MoneyTransferDetails',
  [ActivityType.Card]: () => 'CardActivityDetails',
  [ActivityType.OnChain]: () => 'OnChainActivityDetails',
})

export function getScreenForActivity(activity: Activity): keyof MainNavigatorDef {
  const dispatcher = activityScreenDispatcher[activity.type]

  if (dispatcher) {
    return dispatcher(activity)
  } else {
    return 'DummyActivityDetails'
  }
}
