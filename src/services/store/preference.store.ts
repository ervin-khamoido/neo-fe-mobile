import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { CurrencyCode } from '../../common/constrants'
import { cleanable, ICleanable } from '../../utils/sanitizer'

export interface IPreferenceStore {
  readonly currentCurrency: CurrencyCode

  setCurrentCurrency(value: CurrencyCode): void
}

export const PreferenceStoreSymbol = Symbol.for('IPreferenceStore')

@cleanable
@injectable()
export class PreferenceStore implements IPreferenceStore, ICleanable {
  @observable currentCurrency: CurrencyCode

  constructor() {
    this.currentCurrency = CurrencyCode.USD

    makeObservable(this)
  }

  @action setCurrentCurrency(value: CurrencyCode) {
    this.currentCurrency = value
  }

  @action clean() {
    this.currentCurrency = CurrencyCode.USD
  }
}
