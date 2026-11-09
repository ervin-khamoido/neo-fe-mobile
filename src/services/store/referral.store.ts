import { inject, injectable, postConstruct } from 'inversify'
import { action, makeObservable, observable, observe } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'
import { ReferrerInfo } from '../../models/referral/referrer-info'
import { PersistanceSymbol } from '../../lib/utils/persistance'

export interface IReferralStore {
  readonly referrerInfo: ReferrerInfo | null

  updateReferrerInfo(info: ReferrerInfo): void
}

export const ReferralStoreSymbol = Symbol.for('IReferralStore')

@cleanable
@injectable()
export class ReferralStore implements IReferralStore, ICleanable {
  @inject(PersistanceSymbol) persistance!: { referrerInfo?: ReferrerInfo | null }

  @observable referrerInfo: ReferrerInfo | null

  constructor() {
    makeObservable(this)
  }

  @postConstruct()
  @action
  initialize() {
    this.referrerInfo = this.persistance.referrerInfo ?? null

    observe(this, () => {
      this.persistance.referrerInfo = this.referrerInfo
    })
  }

  @action updateReferrerInfo(info: ReferrerInfo): void {
    this.referrerInfo = info ?? null
  }

  @action clean() {
    this.referrerInfo = null
  }
}
