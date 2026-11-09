import { inject, injectable } from 'inversify'
import { flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { breadcrumb } from '../../utils/breadcrumb'
import { ISupportService, SupportServiceSymbol } from '../../services/support/support.service'
import { ISupportStore, SupportStoreSymbol } from '../../services/store/support.store'
import { screenAnalytics } from '../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Main, AnalyticsScreen.Block)
@breadcrumb('Block Home')
@injectable()
export class HomeBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  @observable loading = false

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onSupport() {
    this.loading = true
    yield this.supportService.navigateToHelpCenter()
    this.loading = false
  }
}
