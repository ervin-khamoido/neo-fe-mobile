import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'

import { CurrencyCode, CurrencyInfo } from '../../../../common/constrants'
import { displayActivityItemCurrency } from '../../../../lib/utils/helpers'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { IOrderService, OrderServiceSymbol } from '../../../../services/order.service'

import { IOrdersStore, OrdersStoreSymbol } from '../../../../services/store/orders.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../../services/store/activity.store'
import { ConnectionError } from '@ts-awesome/request'

@injectable()
export class ActivePaymentBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(OrderServiceSymbol) orderService!: IOrderService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore

  @inject(ToastServiceSymbol) toast!: IToastService

  // currently constant
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get Naira
  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell USDC
  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @observable loading = false

  @computed get poActivity() {
    const activities = this.activityStore.pendingPaymentPOs

    return activities.length ? activities[0] : null
  }

  @computed get soActivity() {
    const activities = this.activityStore.pendingConfirmationSOs

    return activities.length ? activities[0] : null
  }

  @computed get displayPOTotal() {
    return this.formatAmount(this.poActivity.amount)
  }

  @computed get displaySOTotal() {
    return this.formatAmount(this.soActivity.amount)
  }

  constructor() {
    makeObservable(this)
  }

  @flow *onPOContinue() {
    const orderUid = this.poActivity.order

    const order = this.ordersStore.getPurchaseOrder(orderUid)
    if (!order) {
      this.loading = true

      try {
        yield this.orderService.syncPurchaseOrder(orderUid)
      } catch (err) {
        if (err instanceof ConnectionError) {
          this.toast.error('Service Temporary Unavailable')
        } else {
          this.toast.error(err.message)
        }
      } finally {
        this.loading = false
      }
    }

    this.navigationService.navigate('BankTransfer', { uid: orderUid })
  }

  @flow *onSOContinue() {
    this.navigationService.navigate('SellOrderStatus', { uid: this.soActivity.uid })
  }

  onParamsChange() {
    // nothing to do here
  }

  formatAmount(amount) {
    return displayActivityItemCurrency(amount)
  }
}
