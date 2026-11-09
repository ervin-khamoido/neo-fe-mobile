import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class SignInEmailCodeState extends BaseState {
  verifySignInEmailCode(code: string) {
    this.context.setState(AuthStateName.SignInEmailCodeVerify, () => {
      this.context.triggerVerifySignInEmailCode(code)
    })
  }

  resendSignInEmailCode(): void {
    this.context.triggerResendSignInEmailCode()
  }

  editSignInEmail() {
    this.context.setState(AuthStateName.SignInEmail)
  }
}
