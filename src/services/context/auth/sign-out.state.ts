import { BaseState } from './base.state'
import { AuthRequest, AuthStateModal } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class SignOutState extends BaseState {
  entry() {
    this.context.showModal(AuthStateModal.SigningOut)

    // Freshchat integration branch had this change... but it was refactored later
    // this.context.triggerSignOut()
    this.context.triggerCleanUp()
  }

  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.SignOut) {
      return
    }

    this.check()
  }

  emptyFirebaseUser() {
    this.check()
  }

  modalTimeout() {
    this.check()
  }

  check() {
    const { isShowingModal, isModalTimeout, isLastRequestSuccess, isOnboarded } = this.context

    const hasToWaitForModal = (isShowingModal && isModalTimeout) || !isShowingModal

    if (hasToWaitForModal && isLastRequestSuccess && !isOnboarded) {
      this.context.setState(AuthStateName.Onboarding, () => {
        this.context.navigate('Onboarding', true)
      })
    } else if (hasToWaitForModal && isLastRequestSuccess && isOnboarded) {
      this.context.setState(AuthStateName.RegisterOrSignIn, () => {
        this.context.navigate('RegisterOrSignIn', true)
      })
    }
  }
}
