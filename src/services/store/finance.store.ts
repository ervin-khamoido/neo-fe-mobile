import { injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { CalculatedOrder, ExchangeRate } from '../../models'

export interface IFinanceStore {
  // latest exchange rate
  readonly buyExchangeRate: number | null
  readonly sellExchangeRate: number | null

  setExchangeRate(next: ExchangeRate): void

  // current sell/buy order fees
  readonly currentComputedFee: CalculatedOrder | null
  setCurrentFee(value: CalculatedOrder): void
}

export const FinanceStoreSymbol = Symbol.for('IFinanceStore')

@injectable()
export class FinanceStore implements IFinanceStore {
  @observable exchangeRates: ExchangeRate | null = null
  @observable currentComputedFee: CalculatedOrder | null = null

  @computed get buyExchangeRate() {
    return this.exchangeRates?.buyExchangeRate
  }

  @computed get sellExchangeRate() {
    return this.exchangeRates?.sellExchangeRate
  }

  constructor() {
    makeObservable(this)
  }

  @action setExchangeRate(next: ExchangeRate) {
    this.exchangeRates = next
  }

  @action setCurrentFee(value: CalculatedOrder) {
    this.currentComputedFee = value
  }
}
