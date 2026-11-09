import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ISupportStore, SupportStoreSymbol } from '../../../services/store/support.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Support, AnalyticsScreen.Support_HelpCenter, (_, params) => ({ mode: params.mode }))
@breadcrumb('HelpCenter')
@injectable()
export class HelpCenterBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  @observable search = ''

  @computed get firstSection() {
    return this.supportStore.helpCenterFolders
      .map(x => ({
        id: x.id,
        title: x.name,
        data: x.articles.filter(
          x => x.title.toLowerCase().includes(this.search) || x.description.toLowerCase().includes(this.search),
        ),
      }))
      .filter(x => x.data.length)
      .slice(0, 1)
  }

  @computed get hasUnreadFreshchat() {
    return this.supportStore.freshchatUnreadCount !== 0
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onSearchChange(value: string) {
    this.search = value
  }

  onFAQ() {
    this.navigationService.navigate('FAQ')
  }

  onChat() {
    this.navigationService.navigate('ContactSupport')
  }
}
