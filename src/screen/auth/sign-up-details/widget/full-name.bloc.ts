import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction, IReactionDisposer } from 'mobx'
import * as yup from 'yup'

import { IBLoC } from '../../../../ioc'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { FormErrors, FormFieldName, isValidForm, validateForm } from '../../../../lib/utils/form'

import { invalidMessage, requiredMessage } from '../../../../utils/validation'

import { FullNameWidgetProps } from './full-name.widget'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'

@injectable()
export class FullNameBLoC implements IBLoC<FullNameWidgetProps> {
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(InitialPropsSymbol) @observable props!: FullNameWidgetProps

  @observable loading = false
  @observable touched = false
  @observable error: FormErrors<FullNameInput> = {}
  @observable isConfirmModalVisible = false

  private disposer?: IReactionDisposer

  @computed get data() {
    return this.props.data
  }

  @computed get fullName() {
    return this.data?.middleName
      ? `${this.data?.firstName} ${this.data?.middleName} ${this.data?.lastName}`
      : `${this.data?.firstName} ${this.data?.lastName}`
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

  @action onParamsChange(props: FullNameWidgetProps) {
    this.props = props
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    const cleanedValue = name === 'middleName' ? value : this.cleanNamePart(value as string)
    this.props.onChange(name, cleanedValue)
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(FullNameSchema, this.data)
    }
  }

  @flow *onSubmit() {
    this.touched = true

    const isValid = yield isValidForm(FullNameSchema, this.data)
    if (!isValid) {
      return
    }

    this.isConfirmModalVisible = true
  }

  @action onModalClose() {
    this.isConfirmModalVisible = false
  }

  @flow *onFullNameConfirm() {
    this.isConfirmModalVisible = false
    this.loading = true

    try {
      yield this.props.onSubmit()
    } catch (err) {
      this.toast.error(err.message, 10000)
    } finally {
      this.loading = false
    }
  }

  onDestroy() {
    this.disposer?.()
  }

  private cleanNamePart(name: string): string {
    return name?.trim ? name.trim() : name
  }
}

export type FullNameInput = {
  firstName: string
  middleName?: string
  lastName: string
}

const namePartRegex = '^[a-z-]*$'
const middleNameRegex = '^[a-z- ]*$'

const FirstNameLabel = 'First Name'
const MiddleNameLabel = 'Middle Name'
const LastNameLabel = 'Last Name'

const FullNameSchema = yup.object().shape({
  firstName: yup
    .string()
    .required(requiredMessage(FirstNameLabel))
    .matches(new RegExp(namePartRegex, 'i'), { message: invalidMessage(FirstNameLabel) })
    .max(128)
    .label(FirstNameLabel),
  middleName: yup
    .string()
    .matches(new RegExp(middleNameRegex, 'i'), { message: invalidMessage(MiddleNameLabel) })
    .max(128)
    .label(MiddleNameLabel),
  lastName: yup
    .string()
    .required(requiredMessage(LastNameLabel))
    .matches(new RegExp(namePartRegex, 'i'), { message: invalidMessage(LastNameLabel) })
    .max(128)
    .label(LastNameLabel),
})
