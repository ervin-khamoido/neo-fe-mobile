import { BaseState } from './base.state'

import { AuthStateName } from './interfaces'
import { AuthStateModal } from '../../store/auth.store'

export class ApiAuthFailureState extends BaseState {
  entry() {
    this.context.appConfigStore.setCurrentRootView(null)

    this.context.splash.hide()
    this.context.hideAllModals()

    this.context.showModal(AuthStateModal.AuthFailure)
    this.context.modalTimeout()
  }

  retrySignIn() {
    this.context.setState(AuthStateName.ApiAuth)
  }
}
