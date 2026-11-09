import { inject, injectable } from 'inversify'
import { computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ISupportStore, SupportStoreSymbol } from '../../../services/store/support.store'

@injectable()
export class HeaderRightBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  @observable noop = 0

  @computed get hasUnreadFreshchat() {
    return this.supportStore.freshchatUnreadCount !== 0
  }

  constructor() {
    makeObservable(this)
  }

  onInfo() {
    // this.navigationService.navigate()
  }

  onAccountPage() {
    this.navigationService.navigate('Account')
  }

  onParamsChange() {
    // nothing to do here
  }
}
