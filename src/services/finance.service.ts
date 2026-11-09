import { inject, injectable } from 'inversify'

import { FinanceStoreSymbol, IFinanceStore } from './store/finance.store'
import { ApiServiceSymbol, IApiService } from './api.service'
import { ExchangeRate } from '../models'

export interface IFinanceService {
  syncExchangeRates(): Promise<void>
}

export const FinanceServiceSymbol = Symbol.for('IFinanceService')

@injectable()
export class FinanceService implements IFinanceService {
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(FinanceStoreSymbol) exchangeRateStore!: IFinanceStore

  async syncExchangeRates(): Promise<void> {
    const exchangeRates = await this.api.withAuth(
      http => http.get('/api/v1/exchange-rate', { Model: ExchangeRate }),
      //
    )

    this.exchangeRateStore.setExchangeRate(exchangeRates)
  }
}
