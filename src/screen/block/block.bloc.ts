import { inject, injectable } from 'inversify'

import { IBLoC } from '../../ioc'
import { BlockNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { breadcrumb } from '../../utils/breadcrumb'

@breadcrumb('Block Stack')
@injectable()
export class BlockBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<BlockNavigatorDef>

  constructor() {
    // makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
