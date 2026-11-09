import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { IAuthContextInternal, IAuthState } from './interfaces'
import { AuthRequest } from '../../store/auth.store'
import { PhoneVerificationType } from '../../api.service'

export class BaseState implements IAuthState {
  constructor(protected context: IAuthContextInternal) {}

  entry(): void {}
  exit(): void {}

  appInitialized(): void {}

  firebaseUser(user: FirebaseAuthTypes.User): void {}
  emptyFirebaseUser(): void {}
  finishOnboarding(): void {}

  signInOrSignUpWithPhone(): void {}
  signInWithEmail(): void {}

  sendCode(phone: string, type: PhoneVerificationType): void {}
  verifyCode(code: string): void {}
  editPhone(): void {}
  resendCode(): void {}

  requestSuccess(type: AuthRequest): void {}
  requestFailure(type: AuthRequest, error: string, reason?: Error): void {}

  modalTimeout(): void {}
  splashReady(): void {}

  retrySignIn(): void {}
  apiUser(): void {}
  emptyApiUser(): void {}

  sendEmailCode(email: string): void {}
  verifyEmailCode(code: string): void {}
  editEmail(): void {}
  resendEmailCode(): void {}

  sendSignInEmailCode(email: string): void {}
  verifySignInEmailCode(code: string): void {}
  editSignInEmail(): void {}
  resendSignInEmailCode(): void {}

  registrationSessionExpired(): void {}
  signUp(): void {}

  signOut(): void {}

  userStatusChange(): void {}
}
