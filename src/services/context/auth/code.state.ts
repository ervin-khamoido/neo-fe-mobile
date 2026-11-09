import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { BaseState } from './base.state'
import { AuthRequest, AuthStateModal } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class CodeState extends BaseState {
  entry() {
    this.context.hideAllModals()
    this.check()
  }

  firebaseUser(user: FirebaseAuthTypes.User) {
    this.check()
  }

  verifyCode(code: string) {
    this.context.setState(AuthStateName.CodeVerify, () => {
      this.context.showModal(AuthStateModal.CodeVerify)
      this.context.triggerVerifyCode(code)
    })
  }

  resendCode(): void {
    this.context.triggerResendCode()
  }

  editPhone(): void {
    this.context.setState(AuthStateName.Phone)
  }

  private check() {
    const { hasFirebaseUser } = this.context

    // Auto Sign In
    if (hasFirebaseUser) {
      this.context.setState(AuthStateName.ApiAuth, () => {
        this.context.showModal(AuthStateModal.CodeVerify)
      })
    }
  }
}
