import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'

import { AuthStateName } from './interfaces'
import { RequestError } from '@ts-awesome/request'
import { StatusCode } from '../../../common/constrants'

export class EmailState extends BaseState {
  entry() {
    this.context.splash.hide()
    this.context.hideAllModals()
  }

  sendEmailCode(email: string) {
    this.context.authStore.setVerifyEmail(email)

    this.context.triggerSendEmailCode(email)
  }

  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.SendEmailCode) {
      return
    }

    this.context.setState(AuthStateName.EmailCode, () => {
      this.context.navigate('EmailCode')
    })
  }

  signOut() {
    this.context.triggerCleanUp()
    this.context.setState(AuthStateName.Phone, () => {
      this.context.navigate('Phone', true)
    })
  }

  requestFailure(type: AuthRequest, error: string, reason?: Error) {
    if (type !== AuthRequest.SendEmailCode) {
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

          break
      }
    }
  }
}
