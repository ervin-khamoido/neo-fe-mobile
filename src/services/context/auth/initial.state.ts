import { BaseState } from './base.state'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'

import { AuthStateName } from './interfaces'

export class InitialState extends BaseState {
  appInitialized() {
    this.check()
  }

  firebaseUser(user: FirebaseAuthTypes.User) {
    this.check()
  }

  emptyFirebaseUser() {
    this.check()
  }

  splashReady() {
    this.check()
  }

  private check(): void {
    const { isAppInitialized, isOnboarded, hasFirebaseUser, isSplashReady } = this.context

    if (isAppInitialized && hasFirebaseUser === true) {
      this.context.setState(AuthStateName.ApiAuth, () => {
        this.context.appConfigStore.setCurrentRootView(null)
      })
    } else if (isAppInitialized && hasFirebaseUser === false && !isOnboarded && isSplashReady) {
      this.context.setState(AuthStateName.Onboarding, () => {
        this.context.authStore.setInitialScreen('Onboarding')
        this.context.appConfigStore.setCurrentRootView('Auth')
      })
    } else if (isAppInitialized && hasFirebaseUser === false && isOnboarded && isSplashReady) {
      // this.context.setState(AuthStateName.Phone, () => {
      //   this.context.authStore.setInitialScreen('Phone')
      //   this.context.appConfigStore.setCurrentRootView('Auth')
      // })

      this.context.setState(AuthStateName.RegisterOrSignIn, () => {
        this.context.authStore.setInitialScreen('RegisterOrSignIn')
        this.context.appConfigStore.setCurrentRootView('Auth')
      })
    }
  }
}
