import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class OnboardingState extends BaseState {
  entry() {
    this.context.splash.hide()
    this.context.hideAllModals()
  }

  finishOnboarding() {
    this.context.isOnboarded = true

    // this.context.setState(AuthStateName.Phone, () => {
    //   this.context.navigate('Phone', true)
    // })

    this.context.setState(AuthStateName.RegisterOrSignIn, () => {
      this.context.navigate('RegisterOrSignIn', true)
    })
  }
}
