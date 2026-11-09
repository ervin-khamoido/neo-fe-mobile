import { BaseState } from './base.state'
import { AuthRequest } from '../../store/auth.store'

import { AuthStateName } from './interfaces'

export class ApiAuthState extends BaseState {
  entry() {
    this.context.triggerSignIn()
  }

  emptyApiUser() {
    this.check()
  }

  apiUser() {
    this.check()
  }

  requestFailure(type: AuthRequest, error: string) {
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
    const {
      isShowingModal,
      isModalTimeout,
      isLastRequestFailure,
      isLastRequestSuccess,
      hasApiUser,
      isSplashReady,
      isUserBlocked,
    } = this.context

    const isModalReady = (isShowingModal && isModalTimeout) || !isShowingModal

    if (isModalReady && isSplashReady && isLastRequestFailure) {
      if (isUserBlocked) {
        this.context.setState(AuthStateName.UserBlock)
      } else {
        this.context.setState(AuthStateName.ApiAuthFailure)
      }
    }
    if (isModalReady && isSplashReady && isLastRequestSuccess && hasApiUser === false) {
      // new user [verify email address]
      this.context.setState(AuthStateName.Email, () => {
        this.context.authStore.setInitialScreen('Email')
        this.context.appConfigStore.setCurrentRootView('Auth')
        this.context.navigate('Email', true)
      })
    } else if (isLastRequestSuccess && hasApiUser === true) {
      // returning user [sign-in]
      this.context.setState(AuthStateName.MainSetup)
    }
  }
}
