import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class SignInEmailState extends BaseState {
  entry() {
    this.context.splash.hide()
    this.context.hideAllModals()
  }

  signInOrSignUpWithPhone() {
    this.context.setState(AuthStateName.Phone, () => {
      this.context.navigate('Phone', true)
    })
  }

  sendSignInEmailCode(email: string) {
    this.context.authStore.setSignInVerifyEmail(email)

    this.context.triggerSendSignInEmailCode(email)
  }

  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.SendSignInEmailCode) {
      return
    }

    this.context.setState(AuthStateName.SignInEmailCode, () => {
      this.context.navigate('SignInEmailCode')
    })
  }
}
