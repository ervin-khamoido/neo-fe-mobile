import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'

import { IBLoC } from '../../../ioc'
import { AuthNavigatorDef } from '../../common'
import { FormErrors, FormFieldName, isValidForm, setFormValue, validateForm } from '../../../lib/utils/form'
import { EmailInput } from '../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { AuthRequest, AuthStoreSymbol, IAuthStore } from '../../../services/store/auth.store'
import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'
import { breadcrumb } from '../../../utils/breadcrumb'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.SignIn, AnalyticsScreen.SignInEmail)
@breadcrumb('SignIn Email')
@injectable()
export class SignInEmailBloc implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get request() {
    return this.authStore.requests[AuthRequest.SendSignInEmailCode]
  }

  @computed get loading() {
    return this.request.pending
  }
  @computed get requestError() {
    return this.request.error
  }

  @observable touched = false

  @observable data: EmailInput = {
    email: '',
  }
  @observable error: FormErrors<EmailInput> = {
    email: '',
  }

  constructor() {
    makeObservable(this)

    reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.data.email = ''

    reaction(
      () => this.requestError,
      error => {
        if (error) {
          this.error.email = error
        }
      },
    )
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(SignInEmailSchema, this.data)
    }
  }

  @flow *onSubmit() {
    this.touched = true

    const isValid = yield isValidForm(SignInEmailSchema, this.data)
    if (!isValid) {
      return
    }

    this.authContext.sendSignInEmailCode(this.data.email)
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  onParamsChange() {
    // nothing to do here
  }

  onPhone() {
    this.authContext.signInOrSignUpWithPhone()
  }
}

const SignInEmailSchema = yup.object().shape({
  email: yup.string().required().email().label('Email'),
})
