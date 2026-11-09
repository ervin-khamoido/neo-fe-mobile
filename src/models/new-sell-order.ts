import { readable } from '@ts-awesome/model-reader'

export class NewSellOrder {
  @readable(Boolean) includeFees!: boolean
  @readable(Number) amount!: number
  @readable(Number) amountUsdc!: number
  @readable(Number) exchangeRate!: number
  @readable(Number) feeTotal!: number
  @readable(Number) total!: number
  @readable(Number) totalUsdc!: number
  @readable(String) userBankAccount!: string
}
