import { readable } from '@ts-awesome/model-reader'
import { OrderOutput } from './order.output'

export class LiquidityProviderBankAccountOutput {
  @readable(String) uid!: number
  @readable(String) liquidityProvider!: string
  @readable(String) bankName!: string
  @readable(String, true) bankAccountName?: string | null
  @readable(String) bankAccountNumber!: string

  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}

export class PurchaseOrderOutput {
  @readable(OrderOutput) order!: OrderOutput
  @readable(Date) expiresAt!: Date
  @readable(Boolean) includeFees!: boolean
  @readable(Number) amount!: number
  @readable(Number) exchangeRate!: number
  @readable(Number) feeTotal!: number
  @readable(Number) total!: number
  @readable(Number) totalUsdc!: number
  @readable(String) userBankAccount!: string
  @readable(String) liquidityProvider!: string
  @readable(Object) liquidityProviderBankAccount!: LiquidityProviderBankAccountOutput

  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}
