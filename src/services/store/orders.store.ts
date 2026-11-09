import { inject, injectable, named } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { PurchaseOrderOutput, CanCreateOrder } from '../../models'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { PersistanceSymbol } from '../../lib/utils/persistance'

export interface IOrdersStore {
  readonly purchaseOrders: PurchaseOrderOutput[]
  readonly canCreatePO: CanCreateOrder | null
  readonly isFirstTransactionMade: boolean

  upsertPurchaseOrder(order: PurchaseOrderOutput): void
  getPurchaseOrder(uid: string): PurchaseOrderOutput | null
  setCanCreatePO(canCreatePO: CanCreateOrder): void
  setIsFirstTransactionMade(value: boolean): void

  readonly canCreateSO: CanCreateOrder | null

  setCanCreateSO(canCreateSO: CanCreateOrder): void
}

export const OrdersStoreSymbol = Symbol.for('IOrdersStore')

@cleanable
@injectable()
export class OrdersStore implements IOrdersStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('OrdersStore') monitoring!: IMonitoringService
  @inject(PersistanceSymbol) persistance!: { isFirstTransactionMade?: boolean }

  @observable purchaseOrders: PurchaseOrderOutput[] = []
  @observable canCreatePO: CanCreateOrder | null = null
  @observable canCreateSO: CanCreateOrder | null = null

  @computed get isFirstTransactionMade(): boolean {
    return this.persistance.isFirstTransactionMade
  }

  constructor() {
    makeObservable(this)
  }

  @action upsertPurchaseOrder(order: PurchaseOrderOutput): void {
    const orderExists = !!this.purchaseOrders.find(x => x.order.uid === order.order.uid)

    if (orderExists) {
      this.purchaseOrders = this.purchaseOrders.map(
        x => (x.order.uid === order.order.uid ? { ...x, ...order } : x),
        //
      )
    } else {
      this.purchaseOrders.push(order)
    }
  }

  getPurchaseOrder(uid: string): PurchaseOrderOutput {
    return this.purchaseOrders.find(x => x.order.uid === uid) ?? null
  }

  @action setCanCreatePO(canCreatePO: CanCreateOrder): void {
    this.canCreatePO = canCreatePO
  }

  @action setCanCreateSO(canCreateSO: CanCreateOrder): void {
    this.canCreateSO = canCreateSO
  }

  @action setIsFirstTransactionMade(value: boolean): void {
    this.persistance.isFirstTransactionMade = value
  }

  @action clean(): void {
    this.purchaseOrders = []
    this.canCreatePO = null
    this.canCreateSO = null
  }
}
