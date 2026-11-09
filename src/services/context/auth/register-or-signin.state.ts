import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class RegisterOrSignInState extends BaseState {
  entry() {
    this.context.splash.hide()
    this.context.hideAllModals()
  }

  exit() {
    this.context.monitoring.breadcrumb('exit: RegisterOrSignInState')
  }

  signInOrSignUpWithPhone() {
    this.context.setState(AuthStateName.Phone, () => {
      this.context.navigate('Phone', true)
      // TODO: figure if we wan to reset the flow
      //this.context.navigate('Phone')
    })
  }

  signInWithEmail() {
    this.context.setState(AuthStateName.SignInEmail, () => {
      this.context.navigate('SignInEmail', true)
    })
  }
}
