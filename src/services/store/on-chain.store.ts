import { inject, injectable, named } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { CalculatedOnChainOrderOutput } from '../../models'

export interface IOnChainStore {
  readonly currentOnChainOrder: CalculatedOnChainOrderOutput | null
  setCurrentOnChainOrder(value: CalculatedOnChainOrderOutput): void
  resetCurrentOnChainOrder(): void

  readonly incomingCryptoAddress: string | null
  readonly incomingAddressVersion: number | null

  setIncomingCryptoAddress(value: string | null): void
  setIncomingAddressVersion(value: number | null): void
}

export const OnChainStoreSymbol = Symbol.for('IOnChainStore')

@cleanable
@injectable()
export class OnChainStore implements IOnChainStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('OnChainStore') monitoring!: IMonitoringService

  @observable incomingAddressVersion: number | null = null
  @observable incomingCryptoAddress: string | null = null

  @observable currentOnChainOrder: CalculatedOnChainOrderOutput | null = null

  constructor() {
    makeObservable(this)

    this.clean()
  }

  @action setCurrentOnChainOrder(value: CalculatedOnChainOrderOutput): void {
    this.currentOnChainOrder = value
  }

  @action resetCurrentOnChainOrder(): void {
    this.currentOnChainOrder = null
  }

  @action setIncomingCryptoAddress(value: string | null): void {
    this.incomingCryptoAddress = value
  }

  @action setIncomingAddressVersion(value: number | null): void {
    this.incomingAddressVersion = value
  }

  @action clean() {
    this.incomingCryptoAddress = null
    this.incomingAddressVersion = null
  }
}
