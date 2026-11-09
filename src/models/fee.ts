import { readable } from '@ts-awesome/model-reader'

export class CalculatedItem {
  @readable(String) label!: string
  @readable(String) code!: string
  @readable(Number) value!: number
  @readable(String) valueFormatted!: string
}

class ExchangeRate {
  @readable(Number) value!: number
  @readable(String) valueFormatted!: string
  @readable(Date, true) date?: Date
}

export class ExchangeRates {
  @readable(ExchangeRate) client!: ExchangeRate
  @readable(ExchangeRate) server!: ExchangeRate
}

class Message {
  @readable(String) code!: string
  @readable(String) message!: string
}

export class CalculatedOrder {
  @readable(Number) exchangeRate!: number
  @readable(Number) amount!: number
  @readable(Number) amountUsdc!: number
  @readable(Number) total!: number
  @readable(Boolean) includeFees!: boolean
  @readable(Number) feeTotal!: number

  @readable(ExchangeRates) exchangeRates!: ExchangeRates
  @readable([CalculatedItem]) calculatedItems!: CalculatedItem[]
  @readable([Message]) messages!: Message[]
}
