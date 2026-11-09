import { inject, injectable } from 'inversify'
import { computed, makeObservable } from 'mobx'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthStateModal, AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'

import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'

@injectable()
export class SigningOutModalBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get isVisible() {
    return this.authStore.modals[AuthStateModal.SigningOut]
  }

  constructor() {
    makeObservable(this)
  }

  onAnimationFinished() {
    this.authContext.modalTimeout()
  }

  onParamsChange() {
    // nothing to do here
  }
}
