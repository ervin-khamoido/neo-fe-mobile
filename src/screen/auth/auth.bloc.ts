import { inject, injectable } from 'inversify'
import { computed, makeObservable } from 'mobx'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'
import { breadcrumb } from '../../utils/breadcrumb'

@breadcrumb('Auth Stack')
@injectable()
export class AuthBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>

  @inject(AuthStoreSymbol) authStore!: IAuthStore

  @computed get initial() {
    return this.authStore.initialScreen
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
