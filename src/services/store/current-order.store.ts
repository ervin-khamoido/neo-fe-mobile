import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { CalculatedOrder } from '../../models'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { TransferOrderInput } from '../../models/input/transfer-order.input'

export interface ICurrentOrderStore extends ICleanable {
  // sell/buy order
  readonly currentCalculatedOrder: CalculatedOrder | null
  setCurrentCalculatedOrder(value: CalculatedOrder): void

  readonly selectedBankAccount: string | null
  selectCurrentBankAccount(value: string): void

  readonly sellOrderStartAt: Date | null
  setSellOrderStartAt(value: Date): void

  // transfer order
  readonly currentTransferOrder: TransferOrderInput | null
  startTransferOrder(): void
  updateTransferOrder<TKey extends keyof TransferOrderInput>(name: TKey, value: TransferOrderInput[TKey]): void
  resetTransferOrder(): void
}

export const CurrentOrderStoreSymbol = Symbol.for('ICurrentOrderStore')

@cleanable
@injectable()
export class CurrentOrderStore implements ICurrentOrderStore, ICleanable {
  @observable currentCalculatedOrder: CalculatedOrder | null = null
  @observable selectedBankAccount: string | null
  @observable sellOrderStartAt: Date | null

  constructor() {
    makeObservable(this)
  }

  @action setCurrentCalculatedOrder(value: CalculatedOrder): void {
    this.currentCalculatedOrder = value
  }

  @action selectCurrentBankAccount(value: string): void {
    this.selectedBankAccount = value
  }

  @action setSellOrderStartAt(value: Date): void {
    this.sellOrderStartAt = value
  }

  @observable currentTransferOrder: TransferOrderInput | null = null

  @action startTransferOrder(): void {
    this.currentTransferOrder = {
      amountUsdc: 0,
      receiver: null,
    }
  }
  @action updateTransferOrder<TKey extends keyof TransferOrderInput>(
    name: TKey,
    value: TransferOrderInput[TKey],
  ): void {
    this.currentTransferOrder[name] = value
  }
  @action resetTransferOrder(): void {
    this.currentTransferOrder = null
  }

  @action clean() {
    this.currentCalculatedOrder = null
    this.selectedBankAccount = null
    this.currentTransferOrder = null
  }
}
