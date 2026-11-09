2021

import { readable } from '@ts-awesome/model-reader'
import read from '@ts-awesome/model-reader'
import { isAfter } from 'date-fns'

// all of these models should reflect backend models

export enum ActivityType {
  Buy = 'Buy',
  Sell = 'Sell',
  Yield = 'Yield',
  Reward = 'Reward',

  Transfer_Send = 'Transfer_Send',
  Transfer_Receive = 'Transfer_Receive',

  Card = 'card',

  OnChain = 'OnChain',
  Lock = 'Lock',
}

export enum TransactionMode {
  BankTransfer = 'bank_transfer',
  USSD = 'ussd',
}

// Transfer Order Details
interface ITransferCommonDetails {
  title: string
  description?: string | null
}

export interface ITransferSendDetails extends ITransferCommonDetails {
  receiver: string // User UID
  receiverUsername: string
  receiverDisplayName: string
  type: ActivityType.Transfer_Send
  orderReferenceNumber: string
}

export interface ITransferReceiveDetails extends ITransferCommonDetails {
  sender: string // User UID
  senderUsername: string
  senderDisplayName: string
  type: ActivityType.Transfer_Receive
  orderReferenceNumber: string
}

export type ITransferOrderDetails = ITransferSendDetails | ITransferReceiveDetails

export enum TransferOrderActivityStatus {
  Completed = 'completed',
  Failed = 'failed',
}

export interface IPurchaseOrderDetails {
  type: ActivityType.Buy
  transactionMode: TransactionMode
  userBankAccountNumber: string
  amount: number
  exchangeRate: number
  fee: number
}

export interface ISellOrderDetails {
  type: ActivityType.Sell
  userBankAccountNumber: string
  amount: number
  amountUsdc: number
  exchangeRate: number
  fee: number
}

export interface IYieldOrderPeriod {
  start: Date
  end: Date
}

export interface IYieldOrderDetails {
  type: ActivityType.Yield
  subType: string
  period: IYieldOrderPeriod
  // we keep this property for backward compatibility
  // TODO: remove when https://neobank.atlassian.net/browse/NEOBANK-899 is done
  month: number
  yieldMonth: number
  credited: Date
  averageInterestRate?: number | null
}

export interface IRewardOrderDetails {
  type: ActivityType.Reward
  rewardType: RewardType

  title: string
  credited: Date
  description?: string | null
  exchangeRate: number
  details: IActivityRewardDetails
}

export type IActivityRewardDetails = IRewardOrderCashbackActivityDetails | IRewardOrderReferralActivityDetails

export interface IRewardOrderCashbackActivityDetails {
  rewardType: RewardType.Cashback_Buy
  percentage: number
  totalUsdc: number // amount the user saved in USDC
  amount: number // amount the user saved in NGN
  cashbackUsdc: number // amount won from cashback in USDC
  version: 'v1'
}

export interface IRewardOrderReferralActivityDetails {
  rewardType: RewardType.Referral_Referrer
  referrerPayoutsCount: number
  version: 'v1'
}

export enum CardOrderType {
  Fund = 'fund',
  Unload = 'unload',
  Spend = 'spend',
  Reversal = 'reversal',

  Fee = 'fee', // creation fee
  SpendFee = 'spend_fee', // spend fee
}

export interface ICardOrderFundDetails {
  type: ActivityType.Card
  orderType: CardOrderType.Fund
  card: string
  cardNumber: string
  fee: number
  feeFormatted: string
}

export interface ICardOrderUnloadDetails {
  type: ActivityType.Card
  orderType: CardOrderType.Unload
  card: string
  cardNumber: string
}

export interface ICardOrderSpendDetails {
  type: ActivityType.Card
  orderType: CardOrderType.Spend
  card: string
  cardNumber: string
  providerDescription: string | null
  fee: number
  feeFormatted: string
}

export interface ICardOrderReversalDetails {
  type: ActivityType.Card
  orderType: CardOrderType.Reversal
  card: string
  cardNumber: string
}

export interface ICardOrderFeeDetails {
  type: ActivityType.Card
  orderType: CardOrderType.Fee | CardOrderType.SpendFee
  card: string
  cardNumber: string
}

export type ICardOrderDetails =
  | ICardOrderFundDetails
  | ICardOrderUnloadDetails
  | ICardOrderSpendDetails
  | ICardOrderReversalDetails
  | ICardOrderFeeDetails

export enum RewardType {
  Cashback_Buy = 'cashback.buy',
  Referral_Referrer = 'referral.referrer',
  Promotion_Campaign = 'promotion.campaign',
}

export const RewardTypes = Object.keys(RewardType).map<RewardType>(x => RewardType[x])

export type RewardModeType = RewardType | ActivityType.Yield

export enum PurchaseOrderActivityStatus {
  NewPurchase = 'new_purchase',
  PaymentSent = 'payment_sent',
  ConfirmingPayment = 'confirming_payment',
  PaymentConfirmed = 'payment_confirmed',
  ConvertingToUSDC = 'converting_to_usdc',
  USDCDeposited = 'usdc_deposited',
  Cancelled = 'cancelled',
  PaymentNotReceived = 'payment_not_received',
  Refunded = 'refunded',
}

export enum SellOrderActivityStatus {
  OrderPlaced = 'order_placed',
  WithdrawingUSDC = 'withdrawing_usdc',
  ConvertingUSDC = 'converting_usdc',
  TransferringNGN = 'transferring_ngn',
  TransferSuccessful = 'transfer_successful',
  Completed = 'completed',
  RefundingUSDC = 'refunding_usdc',
  Cancelled = 'cancelled',
}

export enum YieldOrderActivityStatus {
  Completed = 'completed',
}

export enum RewardOrderActivityStatus {
  Completed = 'completed',
}

export enum RefundedPurchaseOrderReason {
  Expired = 'expired',
  WrongAmount = 'wrong_amount',
}
export enum RefundedSellOrderReason {
  FailedWithdrawing = 'failed_withdrawing',
  Refunded = 'refunded',
}

export enum CardOrderActivityStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export enum OnChainOrderType {
  Receive = 'receive',
  Send = 'send',
}

export enum OnChainOrderActivityStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
  Quarantine = 'quarantine',
}

export enum OnChainToken {
  TAVAXC = 'tavaxc',
  TAVAXC_LINK = 'tavaxc:link',

  AVAXC = 'avaxc',
  AVAXC_USDC = 'avaxc:usdc',
}

export enum LockOrderActivityStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}

export interface IOnChainOrderReceiveDetails {
  type: ActivityType.OnChain
  orderType: OnChainOrderType.Receive

  fromAddress: string
  toAddress: string

  coin: string
  baseCoin: string

  fee: string
}

export interface IOnChainSendOrderDetails {
  type: ActivityType.OnChain
  orderType: OnChainOrderType.Send

  fromAddress: string
  toAddress: string

  coin: string
  baseCoin: string

  fee: string

  fees: IOnChainFeeResult
  totalUsdc: number
}

export interface IOnChainFeeResult {
  totalFeeUsdc: number
  networkFeeUsdc: number
  neobankFeeUsdc: number
}

export type IOnChainOrderDetails = IOnChainOrderReceiveDetails | IOnChainSendOrderDetails

export enum LockOrderType {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

export interface ILockOrderDepositDetails {
  type: ActivityType.Lock
  orderType: LockOrderType.Deposit

  lockName: string
  lock: string

  amountUsdc: number
  feeUsdc: number
  totalUsdc: number
}

export interface ILockOrderWithdrawDetails {
  type: ActivityType.Lock
  orderType: LockOrderType.Withdraw

  lockName: string
  lock: string
  withdrawalPercentageFee: number

  amountUsdc: number
  feeUsdc: number
  totalUsdc: number
}

export type ILockOrderDetails = ILockOrderDepositDetails | ILockOrderWithdrawDetails

export type ActivityStatusEnum =
  | PurchaseOrderActivityStatus
  | SellOrderActivityStatus
  | YieldOrderActivityStatus
  | RewardOrderActivityStatus
  | TransferOrderActivityStatus
  | CardOrderActivityStatus
  | OnChainOrderActivityStatus
  | LockOrderActivityStatus

export class ActivityStatus {
  @readable(String) status!: ActivityStatusEnum
  @readable(String, true) statusReason!: string | null
  @readable(Date) statusDatetime!: Date

  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}

export class Activity {
  @readable(String) uid!: string
  @readable(String, true) comment?: string | null
  @readable(String) type!: ActivityType
  @readable(String) order!: string
  @readable(String) orderReferenceNumber!: string
  @readable(Number) amountUsdc!: number
  @readable(Number) amount!: number
  @readable(Object) details!:
    | IPurchaseOrderDetails
    | ISellOrderDetails
    | IYieldOrderDetails
    | IRewardOrderDetails
    | ITransferOrderDetails
    | ICardOrderDetails
    | IOnChainOrderDetails
    | ILockOrderDetails

  @readable(String) status!: ActivityStatusEnum
  @readable([ActivityStatus]) statuses!: ActivityStatus[]

  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date

  // only available in firestore
  @readable(Date, true) seenAt?: Date | null | undefined

  static read(values: any): Activity {
    return read(values, Activity)!
  }

  get isNew() {
    return !this.seenAt || this.statuses.some(x => isAfter(x.updatedAt, this.seenAt))
  }
}
