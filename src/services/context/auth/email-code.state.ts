import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class EmailCodeState extends BaseState {
  verifyEmailCode(code: string) {
    this.context.setState(AuthStateName.EmailCodeVerify, () => {
      this.context.triggerVerifyEmailCode(code)
    })
  }

  resendEmailCode(): void {
    this.context.triggerResendEmailCode()
  }

  editEmail() {
    this.context.setState(AuthStateName.Email)
  }
}
