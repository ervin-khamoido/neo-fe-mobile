import { readable } from '@ts-awesome/model-reader'

export class ExchangeRate {
  @readable(Number) buyExchangeRate: number
  @readable(Number) sellExchangeRate: number
}

export class FeeExchangeRateDetail {
  @readable(Number) value: number
  @readable(String) valueFormatted: string
  @readable(Date, true) date: Date
}

export class FeeExchangeRate {
  @readable(FeeExchangeRateDetail) client: FeeExchangeRateDetail
  @readable(FeeExchangeRateDetail) server: FeeExchangeRateDetail
}
