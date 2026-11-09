import { inject, injectable } from 'inversify'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ISupportChatService, SupportChatServiceSymbol } from '../../../services/support/support-chat.service'
import { computed, makeObservable } from 'mobx'
import { ISupportStore, SupportStoreSymbol } from '../../../services/store/support.store'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { RemoteConfig } from '../../../services/remote-config.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'

type ContactSupportParams = MainNavigatorDef['EmailSupport']

@screenAnalytics(AnalyticsFlow.Support, AnalyticsScreen.Support_ContactSupport, (_, params) => ({ mode: params.mode }))
@breadcrumb('Contact Support')
@injectable()
export class ContactSupportBLoC implements IBLoC<unknown, ContactSupportParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(SupportChatServiceSymbol) supportChatService!: ISupportChatService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  @inject(NavigationParamsSymbol) params!: any

  @computed get hasUnreadFreshchat() {
    return this.supportStore.freshchatUnreadCount !== 0
  }

  @computed get supportInAppChatEnabled() {
    return !!this.appConfigStore.remoteConfig[RemoteConfig.SupportInAppChat]
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  async onChatSupport() {
    if (!this.supportInAppChatEnabled) {
      return
    }

    this.analyticsService.openScreen(AnalyticsFlow.Support, AnalyticsScreen.Support_Chat, {
      mode: this.params.mode,
    })
    await this.supportChatService.showConversations()
    this.analyticsService.closeScreen(AnalyticsFlow.Support, AnalyticsScreen.Support_Chat, {
      mode: this.params.mode,
    })
  }

  onEmailSupport() {
    this.navigationService.navigate('EmailSupport')
  }
}
