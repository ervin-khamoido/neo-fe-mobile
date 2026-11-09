import { inject, injectable, named } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { SignUpInput } from '../../models/input'
import { FormFieldName, setFormValue } from '../../lib/utils/form'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { Country } from '../../utils/country-state-city/typing'

export interface ISignUpStore {
  readonly data: SignUpInput | null

  set<T>(name: FormFieldName, value: T): void
  start(): void
  reset(): void
}

export const SignUpStoreSymbol = Symbol.for('ISignUpStore')

@cleanable
@injectable()
export class SignUpStore implements ISignUpStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('SignUpStore') monitoring!: IMonitoringService

  @observable data: SignUpInput | null = null

  constructor() {
    makeObservable(this)
  }

  @action set<T>(name: FormFieldName, value: T): void {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  @action start(): void {
    this.monitoring.assert(!this.data, 'Expected a sign-up data to be null')

    const now = new Date()

    this.data = {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: null,
      country: Country.NG,
      address: null,
      username: '',
      referrerCode: null,
    }
  }

  @action reset(): void {
    this.monitoring.assert(!this.data, 'SignUpStore::reset(): resetting empty state')

    this.data = null
  }

  @action clean() {
    this.data = null
  }
}
