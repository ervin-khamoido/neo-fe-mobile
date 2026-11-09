import { inject, injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'
import * as helpers from '../lib/utils/helpers'

import { IBLoC } from '../ioc'
import { AuthNavigatorDef } from './common'

import { INavigationService, NavigationServiceSymbol } from '../services/navigation.service'

@injectable()
export class ServerDownBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
