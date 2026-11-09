import { inject, injectable } from 'inversify'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { computed, flow, makeObservable, observable } from 'mobx'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { DeviceServiceSymbol, IDeviceService } from '../../../services/device.service'
import { IOnChainService, OnChainServiceSymbol } from '../../../services/on-chain.service'
import { IOnChainStore, OnChainStoreSymbol } from '../../../services/store/on-chain.store'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { RemoteConfig } from '../../../services/remote-config.service'
import { IWaitlistService, WaitlistFeature, WaitlistServiceSymbol } from '../../../services/waitlist.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Receive, AnalyticsScreen.Receive_Address)
@breadcrumb('Receive Amount')
@injectable()
export class ReceiveAddressBLoC implements IBLoC {
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(DeviceServiceSymbol) deviceService!: IDeviceService
  @inject(OnChainServiceSymbol) onChainService!: IOnChainService
  @inject(WaitlistServiceSymbol) waitlistService!: IWaitlistService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  @inject(OnChainStoreSymbol) onChainStore!: IOnChainStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @observable loading = false

  @computed get incomingCryptoAddress() {
    return this.onChainStore.incomingCryptoAddress
  }

  @computed get isAddressPending() {
    return !this.incomingCryptoAddress
  }

  @computed get isReceiveOnChainEnabled() {
    const { remoteConfig } = this.appConfigStore

    return !!remoteConfig[RemoteConfig.ReceiveOnChain]
  }

  @computed get showWaitlist(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[RemoteConfig.ReceiveOnChainWaitlist]
    const userIsDisabledToTryTheFeature = !waitlist.find(x => x.feature === WaitlistFeature.OnChain_Receive)?.enabled

    return waitlistFeatureActivated && userIsDisabledToTryTheFeature
  }

  @computed get isUserInWaitlist(): boolean {
    const { waitlist } = this.userStore

    return !!waitlist.find(x => x.feature === WaitlistFeature.OnChain_Receive)
  }

  @computed get canUserApply(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[RemoteConfig.ReceiveOnChainWaitlist]
    const waitlistItem = waitlist.find(x => x.feature === WaitlistFeature.OnChain_Receive)
    if (waitlistFeatureActivated && waitlistItem) {
      return waitlistItem.enabled
    } else {
      return true
    }
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    if (this.isReceiveOnChainEnabled) {
      if (!this.showWaitlist) {
        yield this.onChainService.syncIncomingCryptoAddress()
      }
    }
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onShare() {
    yield this.deviceService.shareTextOnly(this.incomingCryptoAddress, 'Wallet Address')
  }

  @flow *onAddressCopy() {
    this.deviceService.copyInClipboard(this.incomingCryptoAddress)
    this.toast.info('Copied to clipboard')
  }

  @flow *onReceiveOnChainApply() {
    this.loading = true

    if (!this.showWaitlist) {
      return
    }

    if (this.isUserInWaitlist) {
      return
    }

    try {
      yield this.waitlistService.applyForWaitlist(WaitlistFeature.OnChain_Receive)
    } catch (err: any) {
      this.monitoring.exception(err)
      this.toast.error('Service Temporary Unavailable')
    } finally {
      this.loading = false
    }
  }
}
