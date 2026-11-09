import { FirebaseAuthTypes } from '@react-native-firebase/auth'

import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'
import { AuthStateName } from './interfaces'

export class CodeVerifyState extends BaseState {
  firebaseUser(user: FirebaseAuthTypes.User) {
    this.context.setState(AuthStateName.ApiAuth)
  }

  requestFailure(type: AuthRequest, error: string) {
    if (type !== AuthRequest.VerifyCode) {
      this.context.monitoring.assert(true, `${CodeVerifyState.name}: unexpected request failure`)
      return
    }

    this.check()
  }

  modalTimeout() {
    this.check()
  }

  splashReady() {
    this.check()
  }

  private check() {
    const { isShowingModal, isModalTimeout, isLastRequestFailure, isSplashReady } = this.context

    const hasToWaitForModal = (isShowingModal && isModalTimeout) || !isShowingModal

    if (hasToWaitForModal && isLastRequestFailure && isSplashReady) {
      this.context.setState(AuthStateName.Code)
    }
  }
}
