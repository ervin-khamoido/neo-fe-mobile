import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class SignUpDetailsState extends BaseState {
  entry() {
    this.context.signUpStore.start()
    this.context.navigate('SignUpDetails', true)
  }

  registrationSessionExpired() {
    this.context.setState(AuthStateName.Phone, () => {
      this.context.navigate('Phone', true)
    })
  }

  signUp() {
    this.context.setState(AuthStateName.SignUp)
  }
}
