import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'
import { AuthStateName } from './interfaces'
import { StatusCode } from '../../../common/constrants'
import { RequestError } from '@ts-awesome/request'

export class SignInEmailCodeVerifyState extends BaseState {
  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.VerifySignInEmailCode) {
      return
    }

    this.context.setState(AuthStateName.ApiAuth)
  }

  requestFailure(type: AuthRequest, error: string, reason?: Error) {
    if (type !== AuthRequest.VerifySignInEmailCode) {
      return
    }

    this.context.setState(AuthStateName.SignInEmailCode)
  }
}
