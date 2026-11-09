import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'
import { AuthStateName } from './interfaces'
import { StatusCode } from '../../../common/constrants'
import { RequestError } from '@ts-awesome/request'

export class EmailCodeVerifyState extends BaseState {
  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.VerifyEmailCode) {
      return
    }

    this.context.setState(AuthStateName.SignUpDetails)
  }

  requestFailure(type: AuthRequest, error: string, reason?: Error) {
    if (type !== AuthRequest.VerifyEmailCode) {
      return
    }

    if (reason instanceof RequestError) {
      switch (reason.statusCode) {
        // rear case: registration token expired
        case StatusCode.Unauthorized:
          this.context.setState(AuthStateName.Phone, () => {
            this.context.toast.error('Oops, your registration session has expired. Please, try registering again', 5000)
            this.context.navigate('Phone', true)
          })

          return
      }
    }

    this.context.setState(AuthStateName.EmailCode)
  }
}
