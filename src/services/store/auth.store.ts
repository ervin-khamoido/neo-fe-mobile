import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AuthNavigatorDef } from '../../screen/common'
import { PhoneVerificationType } from '../api.service'

export interface IAuthStore {
  readonly initialScreen: keyof AuthNavigatorDef
  setInitialScreen(screen: keyof AuthNavigatorDef)

  readonly token: string | undefined
  setToken(value: string): void
  resetToken(): void

  readonly verifyEmail: string | null
  setVerifyEmail(email: string): void
  resetVerifyEmail(): void

  readonly verifySignInEmail: string | null
  setSignInVerifyEmail(email: string): void
  resetSignInVerifyEmail(): void

  readonly verifyPhone: string | null
  readonly verifyPhoneType: PhoneVerificationType | null
  setVerifyPhone(phone: string, type: PhoneVerificationType): void
  resetVerifyPhone(): void

  readonly requests: Record<AuthRequest, RequestState>
  setRequestPending(request: AuthRequest, pending: boolean): void
  setRequestError(request: AuthRequest, error: string): void
  resetRequest(request: AuthRequest): void
  resetAllRequests(): void

  readonly modals: Record<AuthStateModal, boolean>
  setModalActive(modal: AuthStateModal, active: boolean)
  closeAllModals()
}

export const AuthStoreSymbol = Symbol.for('IAuthStore')

@cleanable
@injectable()
export class AuthStore implements IAuthStore, ICleanable {
  constructor() {
    makeObservable(this)
  }

  @observable initialScreen: keyof AuthNavigatorDef
  @action setInitialScreen(screen: keyof AuthNavigatorDef) {
    this.initialScreen = screen
  }

  @observable token: string | undefined
  @action setToken(value: string): void {
    this.token = value
  }
  @action resetToken(): void {
    this.token = null
  }

  @observable verifyEmail: string | null = null
  @action setVerifyEmail(email: string): void {
    this.verifyEmail = email
  }
  @action resetVerifyEmail(): void {
    this.verifyEmail = null
  }

  @observable verifySignInEmail: string | null = null

  @action setSignInVerifyEmail(email: string): void {
    this.verifySignInEmail = email
  }

  @action resetSignInVerifyEmail(): void {
    this.verifySignInEmail = null
  }

  @observable verifyPhone: string | null = null
  @observable verifyPhoneType: PhoneVerificationType | null = null
  @action setVerifyPhone(phone: string, type: PhoneVerificationType): void {
    this.verifyPhone = phone
    this.verifyPhoneType = type
  }
  @action resetVerifyPhone(): void {
    this.verifyPhone = null
  }

  @observable requests: Record<AuthRequest, RequestState> = Object.keys(AuthRequest).reduce(
    (res, key) => ({ ...res, [AuthRequest[key]]: { pending: false, error: null } }),
    {},
  ) as Record<AuthRequest, RequestState>
  @action setRequestPending(request: AuthRequest, pending: boolean): void {
    this.requests[request].pending = pending
  }
  @action setRequestError(request: AuthRequest, error: string): void {
    this.requests[request].error = error
  }
  @action resetRequest(request: AuthRequest): void {
    this.requests[request].pending = false
    this.requests[request].error = null
  }

  @action resetAllRequests(): void {
    for (const key in this.requests) {
      this.requests[key].pending = false
      this.requests[key].error = null
    }
  }

  @observable modals: Record<AuthStateModal, boolean> = Object.keys(AuthStateModal).reduce(
    (res, key) => ({ ...res, [AuthStateModal[key]]: false }),
    {},
  ) as Record<AuthStateModal, boolean>

  @action setModalActive(modal: AuthStateModal, active: boolean) {
    this.modals[modal] = active
  }
  @action closeAllModals() {
    for (const key in this.modals) {
      this.modals[key] = false
    }
  }

  @action clean(): void {
    this.resetToken()
    this.resetVerifyEmail()
    this.resetVerifyPhone()
  }
}

export enum AuthRequest {
  SendCode = 'send_code_request',
  VerifyCode = 'verify_code_request',
  SignIn = 'sign_in_request',
  SendEmailCode = 'send_email_code_request',
  SendSignInEmailCode = 'send_sign_in_email_code_request',
  VerifyEmailCode = 'verify_email_code_request',
  VerifySignInEmailCode = 'verify_sign_in__email_code_request',
  AddReferrer = 'verify_referrer',
  SignUp = 'sign_up_request',
  MainSetup = 'main_setup_request',
  SignOut = 'sign_out_request',
}

export enum AuthStateModal {
  AuthFailure = 'auth_failure',
  CodeVerify = 'code_verify_modal',
  SigningUp = 'signing_up_modal',
  SigningOut = 'signing_out_modal',
}

type RequestState = {
  pending: boolean
  error: string | null
}
