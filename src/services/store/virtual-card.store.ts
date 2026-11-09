import { inject, injectable, named } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { FormFieldName, setFormValue } from '../../lib/utils/form'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { IssueCardInput } from '../../models/input/issue-card.input'
import { CardIssueInfo, VirtualCardDetails, VirtualCardStatus, VirtualCardStatusInfo } from '../../models'
import { PersistanceSymbol } from '../../lib/utils/persistance'

export interface IVirtualCardStore {
  readonly issueCard: IssueCardInput | null

  onIssueChange<T>(name: FormFieldName, value: T): void
  startCardIssue(): void
  resetCardIssue(): void

  readonly balance: number
  readonly balanceVersion: number
  setBalance(value: number): void
  setBalanceVersion(value: number): void

  readonly cardStatusInfo: VirtualCardStatusInfo
  setCardStatus(value: VirtualCardStatusInfo): void

  readonly cardStatusVersion: number | null
  setCardStatusVersion(value: number | null): void

  readonly cardDetails: VirtualCardDetails | null
  setCardDetails(value: VirtualCardDetails | null): void

  readonly cardIssueInfo: CardIssueInfo
  setCardIssueInfo(value: CardIssueInfo): void
}

export const VirtualCardStoreSymbol = Symbol.for('IVirtualCard')

@cleanable
@injectable()
export class VirtualCardStore implements IVirtualCardStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('VirtualCardStore') monitoring!: IMonitoringService

  @observable @inject(PersistanceSymbol) persistance!: {
    cardBalance?: number | null
    cardBalanceVersion?: number | null
    cardIssueInfo?: CardIssueInfo | null
  }

  @observable issueCard: IssueCardInput | null = null
  @observable cardStatusInfo: VirtualCardStatusInfo = {
    status: VirtualCardStatus.Card_IssuePending,
  }
  @observable cardStatusVersion: number | null = null
  @observable cardDetails: VirtualCardDetails | null = null
  @observable balance = 0
  @observable balanceVersion = 0
  @observable cardIssueInfo: CardIssueInfo = {
    title: 'Virtual Card',
    fees: [],

    minFundAmountUsdc: 0,
    maxFundAmountUsdc: 10,
    minUnloadAmountUsdc: 0,
    maxUnloadAmountUsdc: 0,

    minBalanceRequired: 0,
  }

  constructor() {
    makeObservable(this)

    setImmediate(
      action(() => {
        this.balance = this.persistance.cardBalance ?? 0
        this.balanceVersion = this.persistance.cardBalanceVersion ?? 0

        if (this.persistance.cardIssueInfo) {
          this.cardIssueInfo = this.persistance.cardIssueInfo
        }
      }),
    )
  }

  @action onIssueChange<T>(name: FormFieldName, value: T): void {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  @action startCardIssue(): void {
    this.monitoring.assert(!this.issueCard, 'Expected a visual card data to be null')

    this.issueCard = { bvn: null }
  }

  @action resetCardIssue(): void {
    this.monitoring.assert(!this.issueCard, 'VirtualCardStore::reset(): resetting empty state')

    this.issueCard = null
  }

  @action setCardStatus(cardStatus: VirtualCardStatusInfo) {
    this.cardStatusInfo = cardStatus
  }

  @action setCardStatusVersion(value: number | null): void {
    this.cardStatusVersion = value
  }

  @action setCardDetails(value: VirtualCardDetails | null): void {
    this.cardDetails = value
  }

  @action setBalance(value: number): void {
    this.balance = value
    this.persistance.cardBalance = value
  }

  @action setBalanceVersion(value: number): void {
    this.balanceVersion = value
    this.persistance.cardBalanceVersion = value
  }

  @action setCardIssueInfo(value: CardIssueInfo): void {
    this.cardIssueInfo = value
    this.persistance.cardIssueInfo = value
  }

  @action clean() {
    this.issueCard = null
    this.cardStatusInfo = {
      status: VirtualCardStatus.Card_IssuePending,
    }
    this.cardDetails = null

    this.balance = 0
    this.persistance.cardBalance = 0

    this.balanceVersion = 0
    this.persistance.cardBalanceVersion = 0
  }
}
