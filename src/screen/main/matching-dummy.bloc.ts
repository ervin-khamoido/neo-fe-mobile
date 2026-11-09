import { inject, injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { NavigationParamsSymbol } from '../../ioc/component.scope'
import { breadcrumb } from '../../utils/breadcrumb'

type NavParams = MainNavigatorDef['MatchingDummy']
const ANIMATION_SPECIFIC_DELAY = 3500

@breadcrumb('Matching Dummy')
@injectable()
export class MatchingDummyBLoC implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  private timerPointer = null

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    const { screen, params } = this.navParams

    this.timerPointer = setTimeout(() => this.navigationService.replace(screen, params), ANIMATION_SPECIFIC_DELAY)
  }

  onDestroy(): void {
    if (this.timerPointer) {
      clearTimeout(this.timerPointer)
      this.timerPointer = null
    }
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }
}
