import { OneTimeAction } from '../services/pin.service'
import { LockAmountMode, OnboardingType, RewardModeType, ScreenMode, SendMode } from '../models'

export enum BankAccountWidgetMode {
  SavedAccounts = 'saved_accounts',
  Auth = 'auth',
  Buy = 'buy',
  Sell = 'sell',
  LevelOne = 'level_one',
}

export type AuthNavigatorDef = {
  Onboarding: undefined

  RegisterOrSignIn: undefined
  SignInOptions: undefined

  Phone: undefined
  Code: { phone: string }

  Email: undefined
  EmailCode: undefined

  SignInEmail: undefined
  SignInEmailCode: undefined

  AddBankAccount2: {
    mode: BankAccountWidgetMode
    cta: string
  }
  ServerDown: undefined

  SignUpDetails: undefined
}

export type SignUpNavigatorDef = {
  Referrer: undefined

  // User Level
  AuthFullName: undefined
  AuthDoB: undefined
  AuthAddress: undefined
  AuthUsername: undefined
}

export type MainNavigatorDef = {
  Onboarding: undefined

  MainTabs: undefined

  PendingDetails: { uid: string }
  SavedBankAccounts: undefined
  TransactionsDetails: { uid: string; headerShown?: boolean }
  MoneyTransferDetails: { uid: string; headerShown?: boolean }
  CardActivityDetails: { uid: string; headerShown?: boolean }
  CancelledOrder: { uid: string; headerShown?: boolean }
  OnChainActivityDetails: { uid: string; headerShown?: boolean }
  DummyActivityDetails: { uid: string; headerShown?: boolean }

  //Error
  PaymentNotReceived: { uid: string; headerShown?: boolean }

  MatchingDummy: {
    delay: number
    screen: keyof MainNavigatorDef
    params?: any
  }

  // Money
  Money: undefined
  Receive: undefined
  SendDestination: undefined

  // Buy + Sell
  Amount: { mode: ScreenMode }
  Totals: { mode: ScreenMode }

  // Buy USDC
  PayWithBank: undefined
  AddBankAccount: undefined
  BankTransfer: { uid: string }
  PurchaseOrderDetails: undefined
  // Sell USDC
  SellTotals: undefined
  SellWithBank: undefined
  SellConfirmation: undefined
  SellOrderStatus: { uid: string }
  SellAddBankAccount: undefined
  SellOrderReceived: undefined

  // Reward Order
  RewardDetails: { uid: string }
  RewardsCenter: undefined
  RewardTopic: { mode: RewardModeType }

  // Bank account
  AddBankAccount2: {
    mode: BankAccountWidgetMode
    cta: string
  }
  BankAccountDetails: {
    uid: string
  }

  // Account
  Account: undefined
  DeleteAccount: undefined
  Security: undefined
  AccountLevel: undefined
  Username: undefined
  PersonalDetails: undefined
  Referral: undefined

  // Activity
  Activity: undefined

  // Transaction
  Transaction: undefined

  // PIN code
  EnableAppLock: undefined
  ChangePIN: undefined
  RequestOneTimeAction: { action: OneTimeAction }

  // Build info
  BuildInfo: undefined

  // Biometrics
  EnableBiometrics: undefined

  // Support
  HelpCenter: undefined
  HelpCenterArticle: { id: string }
  ContactSupport: undefined
  EmailSupport: { id?: string | null }
  FAQ: undefined

  // Referral
  Invite: undefined // old screen
  InviteLink: undefined

  // User Level
  LevelOne: undefined
  LevelTwo: undefined

  // Send Money
  SendAmount: { mode: SendMode }
  SendOnChainAddress: { amountUsdc: number }
  SendRecipient: undefined
  SendConfirm: undefined
  SendResult: undefined
  SendOnChainResult: undefined

  // Send OnChain
  SendOnChainConfirm: undefined

  // BVN
  Bvn: undefined

  // Card
  CardFund: undefined
  CardUnload: undefined

  // Lock
  Lock: undefined
  LockDetails: { uid: string }
  LockAmount: { mode: LockAmountMode.Create } | { mode: LockAmountMode.Deposit | LockAmountMode.Withdraw; uid: string }
  LockCreateResult: { mode: LockAmountMode; uid: string; initialDepositUsdc: number; untilDate: string }
  SasDetails: undefined

  // Lottery
  LotteryWinner: undefined

  FeatureOnboarding: { type: OnboardingType }
}

export type MainTabsNavigatorDef = {
  Transaction: undefined
  Money: undefined
  Wallet: undefined
  Card: undefined
}

export type MainLevelOneNavigatorDef = {
  LevelOneFullName: undefined
  LevelOneDoB: undefined
  LevelOneBankAccount: undefined
}

export type MainLevelTwoNavigatorDef = {
  LevelTwoAddress: undefined
}

export type BlockNavigatorDef = {
  Home: undefined

  // Support
  HelpCenter: { mode?: string }
  ContactSupport: { mode?: string }
  EmailSupport: { id?: string | null; mode?: string }
  FAQ: { mode?: string }
}
