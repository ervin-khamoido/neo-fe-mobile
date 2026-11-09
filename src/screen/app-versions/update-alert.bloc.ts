import { inject, injectable } from 'inversify'
import { Linking } from 'react-native'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef, MainNavigatorDef } from '../common'
import { STORE_LINK } from '../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { RemoteConfig } from '../../services/remote-config.service'

@injectable()
export class UpdateAlertBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef & MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @observable loading = false

  @computed get showSkipBtn() {
    return this.appConfigStore.remoteConfig[RemoteConfig.SkipUpdateAppAlert]
  }
  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onUpdate() {
    this.loading = true

    try {
      yield Linking.openURL(STORE_LINK)
    } catch (err) {
      this.toastService.error(err?.message ?? 'Unable to open the external link')
    } finally {
      this.loading = false
    }
  }

  onSkip() {
    this.appConfigStore.setIsAppUpdateSkipped(true)
    this.navigationService.navigate('MainTabs')
  }
}
