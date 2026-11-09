import { inject, injectable } from 'inversify'
import { action, computed, flow, IReactionDisposer, makeObservable, observable, reaction } from 'mobx'
import { sub, format } from 'date-fns'
import * as yup from 'yup'

import { IBLoC } from '../../../../ioc'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'

import { DoBWidgetProps } from './dob.widget'
import { FormErrors, FormFieldName, isValidForm, validateForm } from '../../../../lib/utils/form'
import { requiredMessage } from '../../../../utils/validation'

const MIN_REQUIRED_AGE_TO_USE_NEOBANK = 18

@injectable()
export class DoBBLoC implements IBLoC<DoBWidgetProps> {
  @inject(InitialPropsSymbol) @observable props!: DoBWidgetProps

  private disposer?: IReactionDisposer

  @observable touched = false
  @computed get data(): DoBInput {
    return this.props.data
  }

  @observable error: FormErrors<DoBInput> = {}

  get maxDate() {
    return sub(new Date(), { years: MIN_REQUIRED_AGE_TO_USE_NEOBANK, days: 1 })
  }

  // We use -2 years from the min age value for the default value for the DOB input.
  // This is done intentionally to solve the frustration of not being able to pick a
  // later date/month than the current. The max date value will prevent the selection
  // of the date and month. By setting the default value to 2 years back, we are safe
  // at picking the date/month before the year is selected.
  get defaultPickerDate() {
    return sub(this.maxDate, { years: 2 })
  }

  @observable isConfirmModalVisible = false

  @computed get dateOfBirthFormatted() {
    return this.data?.dateOfBirth ? format(this.data.dateOfBirth, 'MMM dd, yyyy') : ''
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.disposer = reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )
  }

  @action onParamsChange(props: DoBWidgetProps) {
    this.props = props
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.props.onChange(name, value)
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(DoBSchema, this.data)
    }
  }

  @flow *onSubmit() {
    this.touched = true

    const isValid = yield isValidForm(DoBSchema, this.data)
    if (!isValid) {
      return
    }

    this.isConfirmModalVisible = true
  }

  @action onModalClose() {
    this.isConfirmModalVisible = false
  }

  @flow *onDoBConfirm() {
    this.isConfirmModalVisible = false

    try {
      yield this.props.onSubmit()
    } catch (err) {
      this.error.dateOfBirth = err.message
    }
  }

  onDestroy() {
    this.disposer?.()
  }
}

export type DoBInput = {
  dateOfBirth: Date
}

const DoBLabel = 'Date of Birth'

const DoBSchema = yup.object().shape({
  dateOfBirth: yup.date().nullable().required(requiredMessage(DoBLabel)).label(DoBLabel),
})
