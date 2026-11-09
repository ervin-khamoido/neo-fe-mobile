import { inject, injectable } from 'inversify'
import { reaction } from 'mobx'

import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { DeviceStoreSymbol, IDeviceStore } from '../store/device.store'
import { LevelServiceSymbol } from '../level/level.service'
import { ILevelStore } from '../store/level.store'

export interface IAnalyticsService {
  initialize(): Promise<void>

  // screen
  openScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void
  skipScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void
  closeScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: CloseScreenPayload): void

  // UI elements interactions
  selectOption(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SelectOptionPayload): void
  tap(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: TapPayload): void

  // form
  submit(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SubmitPayload): void
}

export interface IAnalyticsImplementation extends IAnalyticsService {
  setUserId(id: string | undefined): void
  setUserProperty(name: string, value: string | number | boolean)
}

export const AnalyticsServiceSymbol = Symbol.for('IAnalyticsService')
export const AnalyticsImplementationSymbol = Symbol.for('IAnalyticsImplementation')

@injectable()
export class AnalyticsService implements IAnalyticsService {
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore
  @inject(LevelServiceSymbol) levelStore!: ILevelStore
  @inject(AnalyticsImplementationSymbol) implementation!: IAnalyticsImplementation

  private screenOpenAt: Record<string, number> = {}

  async initialize(): Promise<void> {
    await this.implementation.initialize()

    reaction(
      () => this.userStore.me?.uid,
      userUid => {
        if (userUid) {
          this.implementation.setUserId(userUid)
        } else {
          this.implementation.setUserId(undefined)
        }
      },
    )

    reaction(
      () => this.deviceStore.splashShown,
      isSplashShown => {
        if (isSplashShown) {
          this.openScreen(AnalyticsFlow.Auth, AnalyticsScreen.Splash)
        } else {
          this.closeScreen(AnalyticsFlow.Auth, AnalyticsScreen.Splash)
        }
      },
    )

    this.trackProperty('referrerCode', () => this.userStore.me?.userDetails?.referrerCode)
    this.trackProperty('status', () => this.userStore.userStatus)
    this.trackProperty('level', () => this.levelStore.currentLevel?.current?.code)
  }

  openScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    this.screenOpenAt[`${flow}_${screen}`] = Date.now()

    this.implementation.openScreen(flow, screen, payload)
  }

  skipScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    this.implementation.skipScreen(flow, screen, payload)
  }

  closeScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: CloseScreenPayload): void {
    const openAt = this.screenOpenAt[`${flow}_${screen}`]
    const now = Date.now()

    this.implementation.closeScreen(flow, screen, {
      ...payload,
      screenActiveMs: now - openAt,
    })
  }

  selectOption(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SelectOptionPayload): void {
    this.implementation.selectOption(flow, screen, payload)
  }

  tap(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: TapPayload): void {
    this.implementation.tap(flow, screen, payload)
  }

  submit(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SubmitPayload): void {
    this.implementation.submit(flow, screen, payload)
  }

  private trackProperty = (name: string, selector: () => string | number | boolean | undefined | null) => {
    reaction(selector, value => {
      if (value) {
        this.implementation.setUserProperty(name, value)
      } else {
        this.implementation.setUserProperty(name, null)
      }
    })
  }
}

export enum AnalyticsFlow {
  Auth = 'auth',
  SignUp = 'sign_up',
  SignIn = 'sign_in',
  Main = 'main',
  Send = 'send',
  Receive = 'receive',
  Card = 'card',
  Cash = 'cash', // sell/buy flows
  Lock = 'lock',
  Lottery = 'lottery',
  Referral = 'referral',
  Reward = 'reward',
  KYC = 'kyc',
  Support = 'support',
  Account = 'account',
}

export enum AnalyticsScreen {
  Splash = 'splash',

  Onboarding = 'onboarding',
  OnboardingStepOne = 'onboarding_step_one',
  OnboardingStepTwo = 'onboarding_step_two',
  OnboardingStepThree = 'onboarding_step_three',
  OnboardingStepFour = 'onboarding_step_four',

  RegisterOrSignIn = 'register_or_signin',
  SignInOptions = 'signin_options',

  Phone = 'phone',
  PhoneCode = 'phone_code',

  Email = 'email',
  EmailCode = 'email_code',

  SignInEmail = 'signin_email',
  SignInEmailCode = 'signin_email_code',

  FullName = 'full_name', // also used in kyc
  DoB = 'dob', // also used in kyc
  Address = 'address', // also used in kyc
  Referrer = 'referrer',
  NeobankTag = 'neobank_tag',

  MainTabs = 'main_tabs',
  MainTabs_Wallet = 'main_tabs_wallet',
  MainTabs_Money = 'main_tabs_money',
  MainTabs_Card = 'main_tabs_card',

  // Blocked User
  Block = 'block',

  // Shared
  BankAccount = 'bank_account',

  // Send Flow
  Send_Destination = 'send_destination',

  Send_Amount = 'send_amount', // on-/off-chain
  Send_Address = 'send_address', // on-chain
  Send_Recipient = 'send_recipient', // off-chain
  Send_Confirm = 'send_confirm', // on-/off-chain
  Send_Result = 'send_result', // on-/off-chain

  // Card Flow
  Card_BVN = 'card_bvn',
  Card_Fund = 'card_fund',
  Card_Unload = 'card_unload',

  // Cash Flow (sell + buy)
  Cash_Amount = 'cash_amount', // sell/buy
  Cash_Totals = 'cash_totals', // sell/buy
  Cash_WithBank = 'cash_with_bank', // sell/buy
  Cash_Confirmation = 'cash_confirmation', // buy
  Cash_OrderDetails = 'cash_order_details', // sell/buy

  // Receive Flow
  Receive_Address = 'receive_address',

  // Lock Flow
  Lock_MyLocks = 'lock_my_locks',
  Lock_LotteryDetails = 'lock_lottery_details',
  Lock_Details = 'lock_details',
  Lock_Amount = 'lock_amount',

  // Lottery Screens
  Lottery_Winner = 'lottery_winner',

  // Referral Flow
  Referral_Invite = 'referral_invite',

  // Reward Flow
  Reward_Center = 'reward_center',
  Reward_CenterByType = 'reward_center_by_type',
  Reward_Activity = 'reward_activity',

  // KYC
  KYC_LevelOne = 'kyc_level_one',
  KYC_LevelTwo = 'kyc_level_two',
  KYC_ProviderVerification = 'kyc_provider_verification',

  // Support
  Support_HelpCenter = 'support_help_center',
  Support_FAQ = 'support_faq',
  Support_ContactSupport = 'support_contact_support',
  Support_Email = 'support_email',
  Support_Chat = 'support_chat',

  // Feature Onboarding
  FeatureOnboarding = 'feature_onboarding',
  FeatureOnboarding_StepOne = 'feature_onboarding_step_one',
  FeatureOnboarding_StepTwo = 'feature_onboarding_step_two',
  FeatureOnboarding_StepThree = 'feature_onboarding_step_three',
  FeatureOnboarding_StepFour = 'feature_onboarding_step_four',

  // Account
  Account_Level = 'account_level',
}

export type ScreenPayload = {
  referral_code?: string
  mode: string
}

export type CloseScreenPayload = {
  screenActiveMs?: number
} & ScreenPayload

export type SelectOptionPayload = {
  option: string
}

export type TapPayload = {
  tag: string
  mode?: string
}

export type SubmitPayload = {
  status?: string
  total?: number
  neobankFee?: number
  providerFee?: number
  amount?: number
  exchangeRate?: number
  mode?: string
  age?: number
}
