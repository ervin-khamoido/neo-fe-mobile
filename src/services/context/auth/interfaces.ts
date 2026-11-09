import { FirebaseAuthTypes } from '@react-native-firebase/auth'

import { ISanitizer } from '../../../utils/sanitizer'
import { AuthNavigatorDef } from '../../../screen/common'

import { IMonitoringService } from '../../monitoring.service'
import { INavigationService } from '../../navigation.service'
import { ISplashService } from '../../splash.service'
import { IToastService } from '../../toast.service'

import { AuthRequest, AuthStateModal, IAuthStore } from '../../store/auth.store'
import { IInvitationStore } from '../../store/invitation.store'
import { IPINStore } from '../../store/pin.store'
import { ISignUpStore } from '../../store/sign-up.store'
import { IAppConfigStore } from '../../store/app-config.store'
import { PhoneVerificationType } from '../../api.service'

export interface IAuthContext {
  initialize(): void

  appInitialized(): void

  firebaseUser(user: FirebaseAuthTypes.User): void
  emptyFirebaseUser(): void
  finishOnboarding(): void

  signInOrSignUpWithPhone(): void
  signInWithEmail(): void

  sendCode(phone: string, type: PhoneVerificationType): void
  verifyCode(code: string): void
  editPhone(): void
  resendCode(): void

  requestSuccess(type: AuthRequest): void
  requestFailure(type: AuthRequest, error: string, reason?: Error): void

  modalTimeout(): void
  splashReady(): void

  retrySignIn(): void
  apiUser(): void
  emptyApiUser(): void

  sendEmailCode(email: string): void
  verifyEmailCode(code: string): void
  editEmail(): void
  resendEmailCode(): void

  sendSignInEmailCode(email: string): void
  verifySignInEmailCode(code: string): void
  editSignInEmail(): void
  resendSignInEmailCode(): void

  registrationSessionExpired(): void
  signUp(): void

  signOut(): void

  userStatusChange(): void
}

export interface IAuthContextInternal extends IAuthContext {
  readonly navigation: INavigationService<AuthNavigatorDef>
  readonly splash: ISplashService
  readonly monitoring: IMonitoringService
  readonly sanitizer: ISanitizer
  readonly toast: IToastService

  readonly authStore: IAuthStore
  readonly invitationStore: IInvitationStore
  readonly pinStore: IPINStore
  readonly signUpStore: ISignUpStore
  readonly appConfigStore: IAppConfigStore

  readonly state: IAuthState

  isAppInitialized: boolean
  isOnboarded: boolean
  hasFirebaseUser: boolean | null
  hasApiUser: boolean | null
  firebasePhoneConfirmation: FirebaseAuthTypes.ConfirmationResult | null
  isShowingModal: boolean
  isModalTimeout: boolean
  isSplashReady: boolean
  isLastRequestFailure: boolean
  isLastRequestSuccess: boolean
  isUserBlocked: boolean

  setState(nextState: symbol, transitionAction?: () => void): void

  // actions
  navigate(screen: keyof AuthNavigatorDef, reset?: true): void

  showModal(type: AuthStateModal): void
  hideAllModals(): void

  resetAuth(): void

  triggerSendCode(phone: string, type: PhoneVerificationType): void
  triggerVerifyCode(code: string): void
  triggerResendCode(): void

  triggerSignIn(): void
  triggerSetup(): void

  triggerSendEmailCode(email: string): void
  triggerVerifyEmailCode(code: string): void
  triggerResendEmailCode(): void

  triggerSendSignInEmailCode(email: string): void
  triggerVerifySignInEmailCode(code: string): void
  triggerResendSignInEmailCode(): void

  triggerSignUp(): void
  triggerSignUpPush(): void

  triggerSignOut(): void
  triggerCleanUp(): void
}

export interface IAuthState {
  entry(): void
  exit(): void

  appInitialized(): void

  firebaseUser(user: FirebaseAuthTypes.User): void
  emptyFirebaseUser(): void
  finishOnboarding(): void

  signInOrSignUpWithPhone(): void
  signInWithEmail(): void

  sendCode(phone: string, type: PhoneVerificationType): void
  verifyCode(code: string): void
  editPhone(): void
  resendCode(): void

  requestSuccess(type: AuthRequest): void
  requestFailure(type: AuthRequest, error: string, reason?: Error): void

  modalTimeout(): void
  splashReady(): void

  retrySignIn(): void
  apiUser(): void
  emptyApiUser(): void

  sendEmailCode(email: string): void
  verifyEmailCode(code: string): void
  editEmail(): void
  resendEmailCode(): void

  sendSignInEmailCode(email: string): void
  verifySignInEmailCode(code: string): void
  editSignInEmail(): void
  resendSignInEmailCode(): void

  registrationSessionExpired(): void
  signUp(): void

  signOut(): void

  userStatusChange(): void
}

export interface IAuthStateConstructor {
  new (context: IAuthContextInternal): IAuthState
}

export const AuthStateName = Object.freeze({
  Initial: Symbol.for('Initial'),
  ApiAuth: Symbol.for('ApiAuth'),
  ApiAuthFailure: Symbol.for('ApiAuthFailure'),
  Code: Symbol.for('Code'),
  CodeVerify: Symbol.for('CodeVerify'),
  Email: Symbol.for('Email'),
  EmailCode: Symbol.for('EmailCode'),
  EmailCodeVerify: Symbol.for('EmailCodeVerify'),
  Main: Symbol.for('Main'),
  MainSetup: Symbol.for('MainSetup'),
  Onboarding: Symbol.for('Onboarding'),

  // NEW SIGN IN STATES
  RegisterOrSignIn: Symbol.for('RegisterOrSignIn'),
  SignInOptions: Symbol.for('SignInOptions'),

  SignInEmail: Symbol.for('SignInEmail'),
  SignInEmailCode: Symbol.for('SignInEmailCode'),
  SignInEmailCodeVerify: Symbol.for('SignInEmailCodeVerify'),

  Phone: Symbol.for('Phone'),
  SignOut: Symbol.for('SignOut'),

  SignUpDetails: Symbol.for('SignUpDetails'),
  SignUp: Symbol.for('SignUp'),

  UserBlock: Symbol.for('UserBlock'),
})
