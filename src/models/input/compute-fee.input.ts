import { readable } from '@ts-awesome/model-reader'

export class ComputeFeeInput {
  @readable(Boolean) includeFees!: boolean
  @readable(Number) amount!: number
  @readable(Number) amountUsdc!: number
  @readable(Number) exchangeRate!: number
}
