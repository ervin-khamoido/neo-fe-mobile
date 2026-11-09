import { readable } from '@ts-awesome/model-reader'
import currency from 'currency.js'
import { CalculatedOrder } from './fee'

export class NewPurchaseOrder {
  @readable(Boolean) includeFees!: boolean
  @readable(Number) amount!: number
  @readable(Number) exchangeRate!: number
  @readable(Number) feeTotal!: number
  @readable(Number) total!: number
  @readable(Number) totalUsdc!: number
  @readable(String) userBankAccount!: string
}
