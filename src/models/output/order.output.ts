import { readable } from '@ts-awesome/model-reader'

export enum OrderType {
  PurchaseOrder = 'PO',
  SellOrder = 'SO',
  YieldOrder = 'YO',
}

export class OrderOutput {
  @readable(String) uid!: string
  @readable(String) orderType!: OrderType
  @readable(String) referenceNumber!: OrderType
  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}
