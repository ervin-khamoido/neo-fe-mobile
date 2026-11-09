import { BaseState } from './base.state'
import { AuthRequest, AuthStateModal } from '../../store/auth.store'
import { AuthStateName } from './interfaces'
import { RequestError } from '@ts-awesome/request'
import { StatusCode } from '../../../common/constrants'

export class SignUpState extends BaseState {
  entry() {
    this.context.showModal(AuthStateModal.SigningUp)

    this.context.triggerSignUp()
  }

  apiUser() {
    this.context.setState(AuthStateName.MainSetup, () => {
      this.context.authStore.resetToken()
      this.context.triggerSignUpPush()
    })
  }

  requestFailure(type: AuthRequest, error: string, reason?: Error) {
    if (type !== AuthRequest.SignUp) {
      return
    }

    this.context.setState(AuthStateName.Phone, () => {
      if (reason instanceof RequestError && reason.statusCode === StatusCode.Conflict) {
        this.context.toast.error(reason.message, 5000)
      } else if (reason instanceof RequestError && reason.statusCode === StatusCode.Gone) {
        this.context.toast.error(reason.message, 5000)
      } else {
        this.context.toast.error('Oops, something went wrong. Please, try registering again', 5000)
      }

      this.context.navigate('Phone', true)
    })
  }
}
