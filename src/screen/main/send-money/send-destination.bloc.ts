import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { RemoteConfig } from '../../../services/remote-config.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { SendMode } from '../../../models'
import { FeatureAccessFactory, FeatureAccessFactorySymbol, IFeatureAccess } from '../../../utils/feature-access'
import { IWaitlistService, WaitlistFeature, WaitlistServiceSymbol } from '../../../services/waitlist.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Destination)
@breadcrumb('Send Destination')
@injectable()
export class SendDestinationBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('SendDestinationBLoC') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(AppConfigStoreSymbol) appConfig!: IAppConfigStore
  @inject(WaitlistServiceSymbol) waitlistService!: IWaitlistService
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(FeatureAccessFactorySymbol) featureAccessFactory!: FeatureAccessFactory

  @observable loading = false

  @computed get showSendUsBankAccountBtn() {
    return this.appConfig.remoteConfig[RemoteConfig.SendUsBankAccount]
  }

  @observable sendOnChainFeature: IFeatureAccess

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.sendOnChainFeature = this.featureAccessFactory(
      RemoteConfig.SendOnChain,
      RemoteConfig.SendOnChainWaitlist,
      WaitlistFeature.OnChain_Send,
    )
  }

  onParamsChange() {
    // nothing to do here
  }

  onSend() {
    this.navigationService.navigate('SendAmount', { mode: SendMode.Internal })
  }

  onSendByCryptoAddress() {
    this.navigationService.navigate('SendAmount', { mode: SendMode.OnChain })
  }

  onSendToUsBankAccount() {
    /* TODO */
  }

  @flow *onSendOnChainApply() {
    this.loading = true

    if (!this.sendOnChainFeature.showWaitlist) {
      return
    }

    if (this.sendOnChainFeature.isUserInWaitlist) {
      return
    }

    try {
      yield this.waitlistService.applyForWaitlist(WaitlistFeature.OnChain_Send)
    } catch (err: any) {
      this.monitoring.exception(err)
      this.toast.error('Service Temporary Unavailable')
    } finally {
      this.loading = false
    }
  }
}
