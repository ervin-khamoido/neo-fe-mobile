import { readable } from '@ts-awesome/model-reader'

export enum VirtualCardStatus {
  // coming soon
  ComingSoon = 'coming_soon',

  // not issued
  NotIssued = 'card_not_issued',

  // waiting
  Cardholder_VerificationPending = 'cardholder_verification_pending',
  Cardholder_Verified = 'cardholder_verified',
  Card_IssuePending = 'card_issue_pending',

  // fail
  Cardholder_Failure = 'cardholder_failure',
  Cardholder_VerificationFailure = 'cardholder_verification_failure',
  Card_IssueFailure = 'card_issue_failure',

  Frozen = 'card_frozen',

  // success
  Card_Issued = 'card_issued',
}

export const VCPendingStatuses = [
  VirtualCardStatus.Cardholder_VerificationPending,
  VirtualCardStatus.Cardholder_Verified,
  VirtualCardStatus.Card_IssuePending,
]

export const VCFailureStatuses = [
  VirtualCardStatus.Cardholder_Failure,
  VirtualCardStatus.Cardholder_VerificationFailure,
  VirtualCardStatus.Card_IssueFailure,
]

export class VirtualCardStatusInfo {
  @readable(String) status!: VirtualCardStatus
  @readable(String, true) statusReason?: string | null
}

export enum CardType {
  Virtual = 'virtual',
  Physical = 'physical',
}

export enum CardBrand {
  Mastercard = 'Mastercard',
  Visa = 'Visa',
}

export class CardBillingAddress {
  @readable(String) address1!: string
  @readable(String) city!: string
  @readable(String) country!: string
  @readable(String) zipCode!: string
  @readable(String) countryCode!: string
  @readable(String) state!: string
}

export class VirtualCardDetails {
  @readable(String) cardNumber!: string
  @readable(String) cardName!: string
  @readable(String) cvv!: string
  @readable(String) expiryMonth!: string
  @readable(String) expiryYear!: string
  @readable(Number) balance!: number
  @readable(String) brand!: CardBrand
  @readable(String) type!: CardType

  @readable(CardBillingAddress) billingAddress!: CardBillingAddress
}

export class CardFeeInfoOutput {
  @readable(String) label!: string
  @readable(Number) value!: number
  @readable(String) valueFormatted!: string
}

export class CardIssueInfo {
  @readable(String) title!: string
  @readable([CardFeeInfoOutput]) fees!: CardFeeInfoOutput[]

  @readable(Number) minFundAmountUsdc!: number
  @readable(Number) maxFundAmountUsdc!: number
  @readable(Number) minUnloadAmountUsdc!: number
  @readable(Number) maxUnloadAmountUsdc!: number

  @readable(Number) minBalanceRequired!: number
}
