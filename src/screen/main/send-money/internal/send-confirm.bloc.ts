import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../../services/store/current-order.store'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'
import { formatUsername } from '../../../../utils/helpers'
import { IUserStore, UserStoreSymbol } from '../../../../services/store/user.store'
import { OneTimeAction } from '../../../../services/pin.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'
import { SendMode } from '../../../../models'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Confirm, () => ({ mode: SendMode.Internal }))
@breadcrumb('Send Confirm')
@injectable()
export class SendConfirmBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  @computed get currentOrder() {
    return this.currentOrderStore.currentTransferOrder
  }

  @computed get displayAmountUsdc() {
    const value = this.currentOrder?.amountUsdc ?? 0

    return formatCurrency(value, CurrencyCode.USD, false)
  }

  @computed get displayName() {
    if (!this.currentOrder) {
      return ''
    }

    const { receiver } = this.currentOrder

    if (receiver.username) {
      return formatUsername(receiver.username)
    }

    return receiver.displayName
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onSend() {
    const { settings } = this.userStore

    if (settings?.enableAppLock) {
      yield this.navigationService.wizard('RequestOneTimeAction', { action: OneTimeAction.CreateTransferOrder })
    } else {
      this.monitoring.exception('Unexpected: the user tried to send without PIN enabled')
    }

    this.navigationService.reset(['MainTabs', 'SendResult'], [])
  }
}
