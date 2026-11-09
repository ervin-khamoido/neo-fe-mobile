import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class MainState extends BaseState {
  entry() {
    this.context.appConfigStore.setCurrentRootView('Main')

    this.context.splash.hide()
    this.context.hideAllModals()
  }

  emptyFirebaseUser() {
    this.context.setState(AuthStateName.SignOut, () => {
      this.context.appConfigStore.setCurrentRootView('Auth')
    })
  }

  signOut() {
    this.context.triggerSignOut()
  }

  userStatusChange() {
    const { isUserBlocked } = this.context

    if (isUserBlocked) {
      this.context.setState(AuthStateName.UserBlock)
    }
  }
}
