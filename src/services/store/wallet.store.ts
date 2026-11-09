import { inject, injectable } from 'inversify'
import { action, makeObservable, observable, observe } from 'mobx'
import { formatISO, parseISO } from 'date-fns'

import { UserBalance, YieldBalance } from '../../models'
import { CurrencyCode } from '../../common/constrants'
import read from '@ts-awesome/model-reader'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { PersistanceSymbol } from '../../lib/utils/persistance'

export interface IWalletStore {
  readonly balance: UserBalance
  readonly balanceVersion: number | null

  readonly yieldBalance: YieldBalance
  readonly yieldBalanceUpdatedAt: Date | null

  setBalance(balance: UserBalance, version: number): void
  setYieldBalance(balance: YieldBalance, ts: Date): void
}

export const WalletStoreSymbol = Symbol.for('IWalletStore')

@cleanable
@injectable()
export class WalletStore implements IWalletStore, ICleanable {
  @inject(PersistanceSymbol) persistance!: WalletStorePersist

  @observable balance: UserBalance
  @observable balanceVersion: number | null

  @observable yieldBalance: YieldBalance
  @observable yieldBalanceUpdatedAt: Date | null

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.balance = this.persistance.balance ?? DefaultBalance
    this.balanceVersion = this.persistance.balanceVersion ? this.persistance.balanceVersion : null

    this.yieldBalance = read(this.persistance.yieldBalance, YieldBalance)! ?? DefaultYieldBalance
    this.yieldBalanceUpdatedAt = this.persistance.yieldBalanceUpdatedAt
      ? parseISO(this.persistance.yieldBalanceUpdatedAt)
      : null

    observe(this, () => {
      this.persistance.balance = this.balance
      this.persistance.balanceVersion = this.balanceVersion ? this.balanceVersion : null

      this.persistance.yieldBalance = this.yieldBalance
      this.persistance.yieldBalanceUpdatedAt = this.yieldBalanceUpdatedAt ? formatISO(this.yieldBalanceUpdatedAt) : null
    })
  }

  @action setBalance(balance: UserBalance, version: number): void {
    this.balance = balance
    this.balanceVersion = version
  }

  @action setYieldBalance(balance: YieldBalance, ts: Date): void {
    this.yieldBalance = balance
    this.yieldBalanceUpdatedAt = ts
  }

  @action clean() {
    this.balance = DefaultBalance
    this.yieldBalance = DefaultYieldBalance
    this.balanceVersion = null
    this.yieldBalanceUpdatedAt = null
  }
}

const DefaultBalance: UserBalance = { balance: 0, currency: CurrencyCode.USD }
const DefaultYieldBalance: YieldBalance = { balance: 0, currency: CurrencyCode.USD, dueDate: new Date() }

type WalletStorePersist = {
  balance?: UserBalance
  balanceVersion?: number

  yieldBalance?: YieldBalance
  yieldBalanceUpdatedAt?: string
}
