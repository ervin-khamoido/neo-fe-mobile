2021

import { inject, injectable, named } from 'inversify'

import { ComputeFeeInput } from '../models/input'
import { CalculatedOrder, CanCreateOrder, NewPurchaseOrder } from '../models'
import { ApiServiceSymbol, IApiService } from './api.service'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from './store/current-order.store'
import { PostEntityOutput, PurchaseOrderOutput } from '../models/output'
import { IOrdersStore, OrdersStoreSymbol } from './store/orders.store'
import { NewSellOrder } from '../models/new-sell-order'
import { ActivityStoreSymbol, IActivityStore } from './store/activity.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ActivityServiceSymbol, IActivityService } from './activity/activity.service'
import { TransferOrderInput } from '../models/input/transfer-order.input'

export interface IOrderService {
  addPurchaseOrder(payload: NewPurchaseOrder): Promise<string>
  syncPurchaseOrder(uid: string): Promise<void>
  syncCanCreatePO(): Promise<void>
  calculateCurrentPurchaseOrder(payload: ComputeFeeInput): Promise<void>
  cancelPurchaseOrder(uid: string): Promise<void>
  confirmPaidPurchaseOrder(uid: string): Promise<void>

  addSellOrder(payload: NewSellOrder): Promise<string>
  syncSellOrder(uid: string): Promise<void>
  syncCanCreateSO(): Promise<void>
  calculateCurrentSellOrder(payload: ComputeFeeInput): Promise<void>
  confirmSellOrder(uid: string): Promise<void>

  // transfer order
  addTransferOrder(payload: TransferOrderInput): Promise<string>
}

export const OrderServiceSymbol = Symbol.for('IOrderService')

@injectable()
export class OrderService implements IOrderService {
  @inject(AppMonitoringServiceSymbol) @named('OrderService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  async addPurchaseOrder(payload: NewPurchaseOrder): Promise<string> {
    const body = { ...payload }

    const order: PostEntityOutput = await this.api.withAuth(
      http => http.post('/api/v4/order/purchase', { Model: PostEntityOutput, body, fireTokenForceRefresh: true }),
      //
    )

    await this.syncPurchaseOrder(order.uid)

    const activity = this.activityStore.activities.find(x => x.order === order.uid)
    if (!activity) {
      this.monitoring.breadcrumb('addSellOrder did not get activity from firebase')

      // falling back to getting an activity from api
      await this.activityService.syncActivityForOrder(order.uid)
    }

    return order.uid
  }

  async syncPurchaseOrder(uid: string): Promise<void> {
    const order = await this.api.withAuth(
      http => http.get(`/api/v1/order/${uid}/purchase`, { Model: PurchaseOrderOutput }),
      //
    )

    this.ordersStore.upsertPurchaseOrder(order)
  }

  async syncCanCreatePO(): Promise<void> {
    const canCreatePO = await this.api.withAuth(
      http => http.get('/api/v1/order/purchase/can-create', { Model: CanCreateOrder }),
      //
    )

    this.ordersStore.setCanCreatePO(canCreatePO)
  }

  async calculateCurrentPurchaseOrder(payload: ComputeFeeInput): Promise<void> {
    const body = { ...payload }

    const order = await this.api.withAuth(
      http => http.post(`/api/v2/calculate/order/purchase`, { Model: CalculatedOrder, body }),
      //
    )

    this.currentOrderStore.setCurrentCalculatedOrder(order)
  }

  async cancelPurchaseOrder(uid: string): Promise<void> {
    await this.api.withAuth(http => http.post(`/api/v1/order/${uid}/purchase/cancel`))
    await this.syncPurchaseOrder(uid)
  }

  async confirmPaidPurchaseOrder(uid: string): Promise<void> {
    await this.api.withAuth(http => http.post(`/api/v1/order/${uid}/purchase/paid`))

    await this.syncPurchaseOrder(uid)
  }

  async addSellOrder(payload: NewSellOrder): Promise<string> {
    const body = { ...payload }

    const order = await this.api.withAuth(
      http =>
        http.post('/api/v4/order/sell', {
          Model: PostEntityOutput,
          body,
          oneTimeAction: true,
          fireTokenForceRefresh: true,
        }),
      //
    )

    // not used now
    // await this.syncSellOrder(order.uid)

    const activity = this.activityStore.activities.find(x => x.order === order.uid)
    if (!activity) {
      this.monitoring.breadcrumb('addSellOrder did not get activity from firebase')

      // falling back to getting an activity from api
      await this.activityService.syncActivityForOrder(order.uid)
    }

    return order.uid
  }

  async syncSellOrder(uid: string): Promise<void> {
    const order = await this.api.withAuth(http => http.get(`/api/v1/order/${uid}/sell`))

    // not used now
    // this.ordersStore.upsertSellOrder(order)
  }

  async syncCanCreateSO(): Promise<void> {
    const canCreateSO = await this.api.withAuth(
      http => http.get('/api/v1/order/sell/can-create', { Model: CanCreateOrder }),
      //
    )

    this.ordersStore.setCanCreateSO(canCreateSO)
  }

  async calculateCurrentSellOrder(payload: ComputeFeeInput): Promise<void> {
    const body = { ...payload }

    const order = await this.api.withAuth(
      http => http.post(`/api/v2/calculate/order/sell`, { Model: CalculatedOrder, body }),
      //
    )

    this.currentOrderStore.setCurrentCalculatedOrder(order)
  }

  async confirmSellOrder(uid: string): Promise<void> {
    await this.api.withAuth(
      http => http.post(`/api/v1/order/${uid}/sell/payment-confirmed`),
      //
    )
  }

  async addTransferOrder(payload: TransferOrderInput): Promise<string> {
    const body = {
      amountUsdc: payload.amountUsdc,
      receiver: payload.receiver.uid,
    }

    const response = await this.api.withAuth(http =>
      http.post('/api/v1/order/transfer', {
        body,
        Model: PostEntityOutput,
        oneTimeAction: true,
        fireTokenForceRefresh: true,
      }),
    )

    return response.uid
  }
}
