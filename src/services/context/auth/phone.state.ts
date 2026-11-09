import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'
import { AuthStateName } from './interfaces'
import { PhoneVerificationType } from '../../api.service'

export class PhoneState extends BaseState {
  entry() {
    this.context.resetAuth()

    this.context.hideAllModals()
  }

  exit() {
    this.context.monitoring.breadcrumb('exit: PhoneState')
  }

  sendCode(phone: string, type: PhoneVerificationType) {
    this.context.authStore.setVerifyPhone(phone, type)

    this.context.triggerSendCode(phone, type)
  }

  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.SendCode) {
      return
    }

    this.context.setState(AuthStateName.Code, () => {
      this.context.navigate('Code')
    })
  }
}
