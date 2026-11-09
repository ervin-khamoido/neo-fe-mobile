import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class MainSetupState extends BaseState {
  entry() {
    this.context.triggerSetup()
  }

  requestSuccess(type: AuthRequest) {
    if (type !== AuthRequest.MainSetup) {
      return
    }

    this.check()
  }

  requestFailure(type: AuthRequest, error: string) {
    if (type !== AuthRequest.MainSetup) {
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

  userStatusChange() {
    this.check()
  }

  private check() {
    const { isModalTimeout, isShowingModal, isLastRequestFailure, isLastRequestSuccess, isSplashReady, isUserBlocked } =
      this.context

    const isModalReady = (isShowingModal && isModalTimeout) || !isShowingModal

    if (isModalReady && isSplashReady && isLastRequestFailure) {
      if (isUserBlocked) {
        this.context.setState(AuthStateName.UserBlock)
      } else {
        this.context.setState(AuthStateName.ApiAuthFailure)
      }
    } else if (isModalReady && isSplashReady && isLastRequestSuccess) {
      this.context.setState(AuthStateName.Main)
    }
  }
}
