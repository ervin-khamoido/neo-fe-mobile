import { inject, injectable } from 'inversify'
import { computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'

import { SignUpNavigatorDef } from '../../common'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { breadcrumb } from '../../../utils/breadcrumb'

@breadcrumb('Sign Up Details Stack')
@injectable()
export class SignUpDetailsBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<SignUpNavigatorDef>

  @observable noop = 1

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
