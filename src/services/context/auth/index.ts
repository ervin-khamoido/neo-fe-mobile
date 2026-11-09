import { inject, injectable, named } from 'inversify'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { AuthStateName, IAuthContext, IAuthContextInternal, IAuthState } from './interfaces'
import { PersistanceSymbol } from '../../../lib/utils/persistance'
import { AuthNavigatorDef } from '../../../screen/common'
import { AuthRequest, AuthStateModal, AuthStoreSymbol, IAuthStore } from '../../store/auth.store'

import { InitialState } from './initial.state'

import { ISplashService, SPLASH_ANIMATION_END_EVENT, SplashServiceSymbol } from '../../splash.service'
import { INavigationService, NavigationServiceSymbol } from '../../navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../monitoring.service'
import { IUserService, UserServiceSymbol } from '../../user.service'
import { IPINService, PINServiceSymbol } from '../../pin.service'
import { ApiServiceSymbol, IApiService, PhoneVerificationType } from '../../api.service'
import { ISanitizer, SanitizerSymbol } from '../../../utils/sanitizer'
import { StatusCode } from '../../../common/constrants'
import { ApiAuthState } from './api-auth.state'
import { ApiAuthFailureState } from './api-auth-failure.state'
import { CodeState } from './code.state'
import { CodeVerifyState } from './code-verify.state'
import { EmailState } from './email.state'
import { EmailCodeState } from './email-code.state'
import { EmailCodeVerifyState } from './email-code-verify.state'
import { SignInEmailState } from './sign-in-email.state'
import { SignInEmailCodeState } from './sign-in-email-code.state'
import { SignInEmailCodeVerifyState } from './sign-in-email-code-verify.state'
import { MainState } from './main.state'
import { MainSetupState } from './main-setup.state'
import { OnboardingState } from './onboarding.state'
import { PhoneState } from './phone.state'
import { SignOutState } from './sign-out.state'
import { SignUpState } from './sign-up.state'
import { IInvitationStore, InvitationStoreSymbol } from '../../store/invitation.store'
import { IPINStore, PINStoreSymbol } from '../../store/pin.store'
import { IToastService, ToastServiceSymbol } from '../../toast.service'
import { InvalidPhoneError } from '../../../models/error/invalid-phone.error'
import { IWalletService, WalletServiceSymbol } from '../../wallet.service'
import { ActivityServiceSymbol, IActivityService } from '../../activity/activity.service'
import { IPushNotificationService, PushNotificationServiceSymbol } from '../../push/push-notification.service'
import { CampaignTrackingService, CampaignTrackingServiceSymbol } from '../../analytics/campaign-analytics.service'
import { SignUpDetailsState } from './sign-up-details.state'
import { ISignUpStore, SignUpStoreSymbol } from '../../store/sign-up.store'
import { ILevelService, LevelServiceSymbol } from '../../level/level.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../store/app-config.store'
import { IReactionDisposer } from 'mobx/dist/core/reaction'
import { computed, reaction } from 'mobx'
import { IUserStore, UserStoreSymbol } from '../../store/user.store'
import { UserStatus } from '../../../models/user-settings'
import { UserBlockState } from './user-block.state'
import { IRemoteConfigService, RemoteConfigServiceSymbol } from '../../remote-config.service'
import { BuildInfoNativeModuleSymbol, IBuildInfoNativeModule } from '../../native-module/build-info.nm'
import { DeviceServiceSymbol, IDeviceService } from '../../device.service'
import { ISupportChatService, SupportChatServiceSymbol } from '../../support/support-chat.service'
import { isServerError } from '../../../utils/helpers'
import { RegisterOrSignInState } from './register-or-signin.state'

export const AuthContextSymbol = Symbol.for('AuthContextSymbol')

@injectable()
export class AuthContext implements IAuthContext, IAuthContextInternal {
  @inject(NavigationServiceSymbol) navigation!: INavigationService<AuthNavigatorDef>
  @inject(SplashServiceSymbol) splash!: ISplashService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(AppMonitoringServiceSymbol) @named('AuthContext') monitoring!: IMonitoringService
  @inject(SanitizerSymbol) sanitizer!: ISanitizer
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(WalletServiceSymbol) walletService!: IWalletService
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(PushNotificationServiceSymbol) pushNotificationService!: IPushNotificationService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(RemoteConfigServiceSymbol) remoteConfigService!: IRemoteConfigService
  @inject(DeviceServiceSymbol) deviceService!: IDeviceService

  @inject(PersistanceSymbol) persistance!: { onboarded?: boolean }

  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(SignUpStoreSymbol) signUpStore!: ISignUpStore
  @inject(InvitationStoreSymbol) invitationStore!: IInvitationStore
  @inject(PINStoreSymbol) pinStore!: IPINStore
  @inject(CampaignTrackingServiceSymbol) campaignTrackingService!: CampaignTrackingService
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @inject(BuildInfoNativeModuleSymbol) buildInfoNM!: IBuildInfoNativeModule
  @inject(SupportChatServiceSymbol) supportChatService!: ISupportChatService

  private readonly states: Record<symbol, IAuthState>
  private _state: IAuthState

  get state(): IAuthState {
    return this._state
  }

  isAppInitialized: boolean
  get isOnboarded() {
    //return false
    return !!this.persistance.onboarded
  }
  set isOnboarded(value: boolean) {
    this.persistance.onboarded = value
  }
  hasFirebaseUser: boolean | null = null
  hasApiUser: boolean | null = null
  firebasePhoneConfirmation: FirebaseAuthTypes.ConfirmationResult | null = null
  isModalTimeout: boolean = false
  isSplashReady: boolean = false
  isShowingModal: boolean = false
  isLastRequestFailure: boolean = false
  isLastRequestSuccess: boolean = false

  @computed get isUserBlocked() {
    return this.userStore.userStatus === UserStatus.Blocked
  }

  constructor() {
    this.states = Object.freeze({
      [AuthStateName.Initial]: new InitialState(this),
      [AuthStateName.ApiAuth]: new ApiAuthState(this),
      [AuthStateName.ApiAuthFailure]: new ApiAuthFailureState(this),
      [AuthStateName.Code]: new CodeState(this),
      [AuthStateName.CodeVerify]: new CodeVerifyState(this),
      [AuthStateName.Email]: new EmailState(this),
      [AuthStateName.EmailCode]: new EmailCodeState(this),
      [AuthStateName.EmailCodeVerify]: new EmailCodeVerifyState(this),
      [AuthStateName.SignInEmail]: new SignInEmailState(this),
      [AuthStateName.SignInEmailCode]: new SignInEmailCodeState(this),
      [AuthStateName.SignInEmailCodeVerify]: new SignInEmailCodeVerifyState(this),
      [AuthStateName.Main]: new MainState(this),
      [AuthStateName.MainSetup]: new MainSetupState(this),
      [AuthStateName.Onboarding]: new OnboardingState(this),
      [AuthStateName.RegisterOrSignIn]: new RegisterOrSignInState(this),
      [AuthStateName.Phone]: new PhoneState(this),
      [AuthStateName.SignOut]: new SignOutState(this),
      [AuthStateName.SignUpDetails]: new SignUpDetailsState(this),
      [AuthStateName.SignUp]: new SignUpState(this),
      [AuthStateName.UserBlock]: new UserBlockState(this),
    })

    this.setState(AuthStateName.Initial)
  }

  setState(nextState: symbol, transitionAction?: () => void): void {
    this._state?.exit()
    transitionAction?.()
    this._state = this.states[nextState]
    this._state.entry()

    setImmediate(() => {
      this.monitoring.breadcrumb(nextState.toString())
    })
  }

  private _disposeBag: IReactionDisposer[] = []

  initialize() {
    // do all subscriptions here

    // firebase notifies about auth status through the callback
    auth().onAuthStateChanged(u => (u ? this.firebaseUser(u) : this.emptyFirebaseUser()))

    // in some cases we have to wait until the animation is over
    this.splash.emitter.addListener(SPLASH_ANIMATION_END_EVENT, () => this.splashReady())

    // user status could change when an API request returns an unauthorized error
    let disposer = reaction(
      () => this.userStore.userStatus,
      () => this.userStatusChange(),
    )
    this._disposeBag.push(disposer)
  }

  // Signals

  appInitialized(): void {
    this.isAppInitialized = true

    this.state.appInitialized()
  }

  emptyFirebaseUser(): void {
    this.hasFirebaseUser = false

    this.state.emptyFirebaseUser()
  }

  firebaseUser(user: FirebaseAuthTypes.User): void {
    this.hasFirebaseUser = true

    this.state.firebaseUser(user)
  }

  finishOnboarding(): void {
    this.state.finishOnboarding()
  }

  signInOrSignUpWithPhone(): void {
    this.state.signInOrSignUpWithPhone()
  }

  signInWithEmail(): void {
    this.state.signInWithEmail()
  }

  sendCode(phone: string, type: PhoneVerificationType): void {
    this.state.sendCode(phone, type)
  }

  verifyCode(code: string): void {
    this.state.verifyCode(code)
  }

  editPhone(): void {
    this.state.editPhone()
  }

  resendCode(): void {
    this.state.resendCode()
  }

  requestSuccess(type: AuthRequest): void {
    this.isLastRequestSuccess = true
    this.authStore.setRequestPending(type, false)

    this.state.requestSuccess(type)
  }

  requestFailure(type: AuthRequest, error: string, reason?: Error): void {
    this.isLastRequestFailure = true
    this.authStore.setRequestError(type, error)
    this.authStore.setRequestPending(type, false)

    this.state.requestFailure(type, error, reason)
  }

  requestResetAll(): void {
    this.isLastRequestFailure = false
    this.isLastRequestSuccess = false
    this.authStore.resetAllRequests()
  }

  retrySignIn(): void {
    this.state.retrySignIn()
  }

  apiUser(): void {
    this.hasApiUser = true
    this.state.apiUser()
  }

  emptyApiUser(): void {
    this.hasApiUser = false
    this.state.emptyApiUser()
  }

  modalTimeout(): void {
    this.isModalTimeout = true
    this.state.modalTimeout()
  }

  splashReady(): void {
    this.isSplashReady = true
    this.state.splashReady()
  }

  sendEmailCode(email: string): void {
    this.state.sendEmailCode(email)
  }

  verifyEmailCode(code: string): void {
    this.state.verifyEmailCode(code)
  }

  editEmail(): void {
    this.state.editEmail()
  }

  resendEmailCode(): void {
    this.state.resendEmailCode()
  }

  sendSignInEmailCode(email: string): void {
    this.state.sendSignInEmailCode(email)
  }

  verifySignInEmailCode(code: string): void {
    this.state.verifySignInEmailCode(code)
  }

  editSignInEmail(): void {
    this.state.editSignInEmail()
  }

  resendSignInEmailCode(): void {
    this.state.resendSignInEmailCode()
  }

  registrationSessionExpired(): void {
    this.state.registrationSessionExpired()
  }

  signUp(): void {
    this.state.signUp()
  }

  signOut(): void {
    this.state.signOut()
  }

  userStatusChange(): void {
    this.state.userStatusChange()
  }

  // [END] Signals

  // Helper Actions

  resetAuth(): void {
    setImmediate(async () => {
      if (auth().currentUser) {
        await auth().signOut()
      }
    })

    this.hasApiUser = null
    this.hasFirebaseUser = false
    this.firebasePhoneConfirmation = null

    this.appConfigStore.setCurrentRootView('Auth')
    this.authStore.resetToken()
  }

  navigate(screen: keyof AuthNavigatorDef, reset?: true): void {
    setImmediate(() => {
      if (reset) {
        this.navigation.reset([screen], [])
      } else {
        this.navigation.navigate(screen)
      }
    })
  }

  showModal(type: AuthStateModal): void {
    this.isShowingModal = true
    this.authStore.setModalActive(type, true)
  }

  hideAllModals(): void {
    this.isShowingModal = false
    this.isModalTimeout = false
    this.authStore.closeAllModals()
  }

  // [END] Helper Actions

  // Actions

  triggerSendCode(phone: string, type: PhoneVerificationType): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SendCode, true)

    setImmediate(async () => {
      try {
        await this.api.validatePhone(phone)

        // if phone confirmation was already done before we need to force the sign in
        // const forceResend = !!this.firebasePhoneConfirmation
        // this.firebasePhoneConfirmation = await auth().signInWithPhoneNumber(phone, forceResend)

        await this.api.sendPhoneCode(phone, type)

        this.requestSuccess(AuthRequest.SendCode)
      } catch (err) {
        this.handleSendCodeError(err)

        this.firebasePhoneConfirmation = null
      }
    })
  }

  triggerVerifyCode(code: string): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.VerifyCode, true)

    setImmediate(async () => {
      try {
        // await this.firebasePhoneConfirmation.confirm(code)
        // this.firebasePhoneConfirmation = null

        const customToken = await this.api.verifyPhoneCode(code)
        await auth().signInWithCustomToken(customToken)

        this.requestSuccess(AuthRequest.VerifyCode)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.VerifyCode, 'Service Temporary Unavailable')
        } else if (err instanceof RequestError && isServerError(err.statusCode)) {
          this.requestFailure(AuthRequest.VerifyCode, 'Service Temporary Unavailable')
        } else if (err instanceof RequestError) {
          switch (err.statusCode) {
            case StatusCode.BadRequest:
              this.requestFailure(AuthRequest.VerifyCode, 'Wrong OTP, please try again')
              break
            case StatusCode.Gone:
              this.requestFailure(
                AuthRequest.VerifyCode,
                'SMS code has expired. Please re-send the verification code and try again',
                err,
              )
              break
            default:
              this.requestFailure(AuthRequest.VerifyCode, 'Something went wrong')
              this.monitoring.exception(err)
              break
          }
        } else {
          switch (err.code) {
            case 'auth/custom-token-mismatch':
            case 'auth/invalid-custom-token':
            default:
              this.requestFailure(AuthRequest.VerifyCode, 'Something went wrong')
              this.monitoring.exception(err)
              break
          }
        }
      }
    })
  }

  triggerResendCode(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SendCode, true)

    setImmediate(async () => {
      // const fbAuth = auth()

      try {
        // this.firebasePhoneConfirmation = await fbAuth.signInWithPhoneNumber(phone, true)

        await this.api.resendPhoneCode()

        this.toast.success('📲 We just sent you a new OTP code')

        this.requestSuccess(AuthRequest.SendCode)
      } catch (err) {
        this.handleSendCodeError(err)
      }
    })
  }

  private handleSendCodeError(err) {
    if (err instanceof InvalidPhoneError) {
      this.requestFailure(AuthRequest.SendCode, err.message)
    } else if (err instanceof RequestError && err.statusCode === StatusCode.BadRequest) {
      // TODO: potentially unfriendly error message
      this.requestFailure(AuthRequest.SendCode, err.message)
    } else if (err instanceof ConnectionError || isServerError(err.statusCode)) {
      this.requestFailure(AuthRequest.SendCode, 'Services Temporarily Unavailable')
    } else {
      this.requestFailure(AuthRequest.SendCode, 'Something went wrong')
      this.monitoring.exception(err)
    }
  }

  triggerSignIn(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SignIn, true)

    setImmediate(async () => {
      try {
        const hasUser = await this.api.signIn()

        this.requestSuccess(AuthRequest.SignIn)
        if (hasUser) {
          this.apiUser()
        } else {
          this.emptyApiUser()
        }
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.SignIn, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          this.requestFailure(AuthRequest.SignIn, err.message)
        } else {
          this.requestFailure(AuthRequest.SignIn, 'Something went wrong...')
          this.monitoring.exception(err)
        }
      }
    })
  }

  triggerSetup(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.MainSetup, true)

    setImmediate(async () => {
      try {
        // 🚨 The methods here shouldn't throw "Unauthorized Error" with a reason "pin_code_token"
        // this behavior blocks the flow because the Promise here won't resolve till the pin is input
        // the pin could be input only after MainSetup state
        await Promise.all([
          this.userService.syncMe(),
          this.userService.syncSettings(),
          //
        ])

        await this.pinService.resetPIN()

        this.requestSuccess(AuthRequest.MainSetup)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.MainSetup, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          this.requestFailure(AuthRequest.MainSetup, err.message)
        } else {
          this.requestFailure(AuthRequest.MainSetup, 'Something went wrong...')
          this.monitoring.exception(err)
        }
      }
    })
  }

  triggerSendSignInEmailCode(email: string): void {
    this.requestResetAll()

    this.authStore.setRequestPending(AuthRequest.SendSignInEmailCode, true)

    setImmediate(async () => {
      try {
        await this.api.sendSignInEmailCode({ email })

        this.requestSuccess(AuthRequest.SendSignInEmailCode)
      } catch (err) {
        this.handleSendSignInEmailCodeError(err)
      }
    })
  }

  triggerVerifySignInEmailCode(code: string): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.VerifySignInEmailCode, true)

    setImmediate(async () => {
      try {
        const firebaseCustomToken = await this.api.verifySignInEmailCode({ code })
        await auth().signInWithCustomToken(firebaseCustomToken)

        this.requestSuccess(AuthRequest.VerifySignInEmailCode)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.VerifySignInEmailCode, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          switch (err.statusCode) {
            // rare case is handled inside of the state
            case StatusCode.Unauthorized:
            case StatusCode.Conflict:
            case StatusCode.BadRequest:
              this.requestFailure(AuthRequest.VerifySignInEmailCode, err.message, err)
              break
            case StatusCode.ServerError:
            default:
              this.requestFailure(AuthRequest.VerifySignInEmailCode, 'Something went wrong...', err)
          }
        } else {
          this.requestFailure(AuthRequest.VerifySignInEmailCode, 'Something went wrong...', err)
          this.monitoring.exception(err)
        }
      }
    })
  }

  triggerResendSignInEmailCode(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SendSignInEmailCode, true)

    setImmediate(async () => {
      try {
        const { verifySignInEmail: email } = this.authStore
        await this.api.sendSignInEmailCode({ email })

        this.toast.success('📩 We just sent you a new OTP code')

        this.requestSuccess(AuthRequest.SendSignInEmailCode)
      } catch (err) {
        this.handleSendSignInEmailCodeError(err)
      }
    })
  }

  triggerSendEmailCode(email: string): void {
    this.requestResetAll()

    this.authStore.setRequestPending(AuthRequest.SendEmailCode, true)

    setImmediate(async () => {
      try {
        await this.api.sendEmailCode({ email })

        this.requestSuccess(AuthRequest.SendEmailCode)
      } catch (err) {
        this.handleSendEmailCodeError(err)
      }
    })
  }

  triggerVerifyEmailCode(code: string): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.VerifyEmailCode, true)

    setImmediate(async () => {
      try {
        await this.api.verifyEmailCode({ code })

        this.requestSuccess(AuthRequest.VerifyEmailCode)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.VerifyEmailCode, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          switch (err.statusCode) {
            // rare case is handled inside of the state
            case StatusCode.Unauthorized:
            case StatusCode.Conflict:
            case StatusCode.BadRequest:
              this.requestFailure(AuthRequest.VerifyEmailCode, err.message, err)
              break
            case StatusCode.ServerError:
            default:
              this.requestFailure(AuthRequest.VerifyEmailCode, 'Something went wrong...', err)
          }
        } else {
          this.requestFailure(AuthRequest.VerifyEmailCode, 'Something went wrong...', err)
          this.monitoring.exception(err)
        }
      }
    })
  }

  triggerResendEmailCode(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SendEmailCode, true)

    setImmediate(async () => {
      try {
        const { verifyEmail: email } = this.authStore
        await this.api.sendEmailCode({ email })

        this.toast.success('📩 We just sent you a new OTP code')

        this.requestSuccess(AuthRequest.SendEmailCode)
      } catch (err) {
        this.handleSendEmailCodeError(err)
      }
    })
  }

  private handleSendEmailCodeError(err) {
    if (err instanceof ConnectionError) {
      this.requestFailure(AuthRequest.SendEmailCode, 'Connection to server lost. Please try again...')
    } else if (err instanceof RequestError) {
      this.requestFailure(AuthRequest.SendEmailCode, err.message, err)
    } else {
      this.requestFailure(AuthRequest.SendEmailCode, 'Something went wrong...')
      this.monitoring.exception(err)
    }
  }

  private handleSendSignInEmailCodeError(err) {
    if (err instanceof ConnectionError) {
      this.requestFailure(AuthRequest.SendSignInEmailCode, 'Connection to server lost. Please try again...')
    } else if (err instanceof RequestError) {
      this.requestFailure(AuthRequest.SendSignInEmailCode, err.message, err)
    } else {
      this.requestFailure(AuthRequest.SendSignInEmailCode, 'Something went wrong...')
      this.monitoring.exception(err)
    }
  }

  triggerSignUp(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SignUp, true)

    setImmediate(async () => {
      try {
        const { data } = this.signUpStore
        await this.api.signUp(data)

        this.apiUser()
        this.campaignTrackingService.trackNewSignUp()

        this.requestSuccess(AuthRequest.SignUp)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.SignUp, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          this.requestFailure(AuthRequest.SignUp, err.message, err)
        } else {
          this.requestFailure(AuthRequest.SignUp, 'Something went wrong...')
          this.monitoring.exception(err)
        }
      } finally {
        this.signUpStore.reset()
      }
    })
  }

  triggerSignUpPush(): void {
    setImmediate(async () => {
      await this.pushNotificationService.pushSignUpNotification()
    })
  }

  triggerSignOut(): void {
    this.requestResetAll()
    this.authStore.setRequestPending(AuthRequest.SignOut, true)

    setImmediate(async () => {
      try {
        await auth().signOut()

        this.requestSuccess(AuthRequest.SignOut)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.requestFailure(AuthRequest.SignOut, 'Connection to server lost. Please try again...')
        } else if (err instanceof RequestError) {
          this.requestFailure(AuthRequest.SignOut, err.message)
        } else {
          this.requestFailure(AuthRequest.SignOut, 'Something went wrong...')
          this.monitoring.exception(err)
        }
      }
    })
  }

  // [END] Actions

  triggerCleanUp(): void {
    setImmediate(async () => {
      this.sanitizer.cleanup()
      await this.supportChatService.resetUser()
    })
  }
}
