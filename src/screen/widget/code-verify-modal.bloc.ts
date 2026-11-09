import { inject, injectable } from 'inversify'
import { computed, makeObservable, reaction } from 'mobx'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthRequest, AuthStateModal, AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { VerifyingType } from '../../models'

@injectable()
export class CodeVerifyModalBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(AuthStoreSymbol) authStore!: IAuthStore

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get request() {
    return this.authStore.requests[AuthRequest.VerifyCode]
  }

  @computed get isVisible() {
    return this.authStore.modals[AuthStateModal.CodeVerify]
  }

  @computed get isVerified() {
    return !this.request.pending && !this.request.error
  }

  @computed get verifyType() {
    return VerifyingType.Phone
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    reaction(
      () => this.isVisible,
      visible => {
        if (visible) {
          setTimeout(() => this.authContext.modalTimeout(), 2000)
        }
      },
    )
  }

  onAnimationFinished() {
    this.authContext.modalTimeout()
  }

  onParamsChange() {
    // nothing to do here
  }
}
