import { inject, injectable } from 'inversify'
import { action, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { InviteInput } from '../../models/input'
import { FormErrors, FormFieldName, setFormValue, validateForm } from '../../lib/utils/form'
import { PhoneRegex } from '../../common/constrants'
import { IUserService, UserServiceSymbol } from '../../services/user.service'
import { breadcrumb } from '../../utils/breadcrumb'

@breadcrumb('Invite')
@injectable()
export class InviteBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(UserServiceSymbol) userService!: IUserService

  @observable loading = false

  @observable touched = false

  @observable data: InviteInput = {
    phone: null,
    email: '',
  }

  @observable errors: FormErrors<InviteInput> = {}

  constructor() {
    makeObservable(this)

    reaction(
      () => [this.data, this.touched],
      () => this.validate(),
    )
  }

  @action validate() {
    if (this.touched) {
      this.errors = validateForm(InviteSchema, this.data)
    }
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    if (typeof name === 'string' && typeof value === 'string' && name === 'emailOrPhone') {
      if (looksLikeAPhone(value)) {
        this.data = { ...this.data, phone: value, email: null }
      } else {
        this.data = { ...this.data, phone: null, email: value }
      }
    } else {
      setFormValue(this, { name: 'data', field: name }, value)
    }
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onSubmit() {
    this.loading = true
    this.touched = true

    const isValid = validateForm(InviteSchema, this.data)
    if (!isValid) {
      this.loading = false
      return
    }

    try {
      yield this.userService.invite(this.data)
    } catch (err) {
    } finally {
      this.loading = false
    }
  }
}

const looksLikeAPhone = <T>(value: T) => typeof value === 'string' && /\+?\d+/g.test(value)

const InviteSchema = yup.object().shape({
  email: yup
    .string()
    .nullable(true)
    .when({
      is: looksLikeAPhone,
      then: yup.string().nullable(true),
      otherwise: yup.string().required().email(),
    })
    .label('Email'),
  phone: yup
    .string()
    .nullable(true)
    .when({
      is: looksLikeAPhone,
      then: yup
        .string()
        .required()
        .test('phone', 'Phone number is invalid', value => {
          value = (value ?? '').replace(/[ ]*/g, '')
          return PhoneRegex.test(value)
        }),
      otherwise: yup.string().nullable(true),
    })
    .label('Phone'),
})
