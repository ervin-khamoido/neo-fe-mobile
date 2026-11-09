import { readable } from '@ts-awesome/model-reader'

export enum MaxLimitReason {
  OneDayLimit = 'limit.1day',
  SevenDayLimit = 'limit.7day',
  ThirtyDayLimit = 'limit.30day',
  CombinedTurnoverLimit = 'limit.combined_turnover',
  ComplianceTransactionLimit = 'limit.compliance_transaction_limit',
  BalanceLimit = 'limit.balance',
}

export enum UserActionType {
  PO = 'po',
  SO = 'so',
  Send = 'send',
}

export class MaxAvailableActionLimit {
  @readable(String) actionType!: UserActionType
  @readable(Number) maxLimit!: number
  @readable(String, true) reason?: MaxLimitReason | null
  @readable(String, true) policy?: string | null
  @readable(Date) timestamp!: Date
}

export class ActionLimits {
  PO: MaxAvailableActionLimit
  SO: MaxAvailableActionLimit
  Send: MaxAvailableActionLimit
}

export const MaxLimitReasonLabel = Object.freeze({
  [MaxLimitReason.OneDayLimit]: 'Daily Limit',
  [MaxLimitReason.SevenDayLimit]: 'Weekly Limit',
  [MaxLimitReason.ThirtyDayLimit]: 'Monthly Limit',
  [MaxLimitReason.CombinedTurnoverLimit]: 'Combined Turnover Limit',
  [MaxLimitReason.ComplianceTransactionLimit]: 'Compliance Transaction Limit',
  [MaxLimitReason.BalanceLimit]: 'Balance',
})

export class TransactionLimits {
  @readable(Number) minBuyAmountUsdc!: number
  @readable(Number) maxBuyAmountUsdc!: number
  @readable(Number) minSellAmountUsdc!: number
  @readable(Number) maxSellAmountUsdc!: number
}
