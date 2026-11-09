import { inject, injectable, named } from 'inversify'
import { IBLoC } from '../../../ioc'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { CardServiceSymbol, ICardService } from '../../../services/card.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { MainTabsNavigatorDef } from '../../common'

@screenAnalytics(AnalyticsFlow.Main, AnalyticsScreen.MainTabs)
@breadcrumb('Main Tab')
@injectable()
export class MainTabsBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('MainTab') monitoring!: IMonitoringService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(CardServiceSymbol) cardService!: ICardService

  async trackBreadcrumb(route: keyof MainTabsNavigatorDef) {
    this.trackAnalytics(route)

    this.monitoring.breadcrumb(`Switching Tab =>: ${route}`)

    // TODO: refactor later
    if (route === 'Card') {
      this.cardService.syncCardBalance().catch(ignore => {})
    }
  }

  constructor() {
    // makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  private currentTab: keyof MainTabsNavigatorDef = 'Wallet'
  onScreenFocus() {
    this.analyticsService.openScreen(AnalyticsFlow.Main, AnalyticsScreen.MainTabs_Wallet)
    this.currentTab = 'Wallet'
  }

  onDestroy() {
    this.analyticsService.closeScreen(AnalyticsFlow.Main, this.getAnalyticsScreen(this.currentTab))
  }

  private trackAnalytics(route: keyof MainTabsNavigatorDef) {
    this.analyticsService.closeScreen(AnalyticsFlow.Main, this.getAnalyticsScreen(this.currentTab))
    this.currentTab = route
    this.analyticsService.openScreen(AnalyticsFlow.Main, this.getAnalyticsScreen(this.currentTab))
  }

  private getAnalyticsScreen(tab: keyof MainTabsNavigatorDef) {
    switch (tab) {
      case 'Wallet':
        return AnalyticsScreen.MainTabs_Wallet
      case 'Money':
        return AnalyticsScreen.MainTabs_Money
      case 'Card':
        return AnalyticsScreen.MainTabs_Card
    }
  }
}
