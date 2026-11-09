import { BaseState } from './base.state'
import { AuthStateName } from './interfaces'

export class UserBlockState extends BaseState {
  entry() {
    this.context.appConfigStore.setCurrentRootView('Blocked')

    this.context.hideAllModals()
    this.context.splash.hide()
  }
}
