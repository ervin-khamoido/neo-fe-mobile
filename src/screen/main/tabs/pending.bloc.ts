import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'

import { getScreenForActivity } from '../common'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IOrdersStore, OrdersStoreSymbol } from '../../../services/store/orders.store'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'

@breadcrumb('Pending')
@injectable()
export class PendingBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(OrderServiceSymbol) orderService!: IOrderService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore

  @computed get activity() {
    return this.activityStore.pending
  }

  @observable loadingItem: string | null = null

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onDetailPress(uid: string) {
    const activity = this.activityStore.getOne(uid)!

    if (!activity) {
      return
    }

    const screen = getScreenForActivity(activity)
    if (screen === 'BankTransfer') {
      const order = this.ordersStore.getPurchaseOrder(activity.order)

      if (!order) {
        this.loadingItem = activity.uid
        yield this.orderService.syncPurchaseOrder(activity.order)

        this.loadingItem = null
      }

      // This screen can be navigated from the activity and it represnts a certain order status.
      this.activityService.markAsRead(activity.uid)
      this.navigationService.navigate('BankTransfer', { uid: activity.order })
    } else {
      this.navigationService.navigate(screen, { uid })
    }
  }
}
