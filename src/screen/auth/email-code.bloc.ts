import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'
import { addSeconds } from 'date-fns'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'
import { FormErrors, FormFieldName, isValidForm, setFormValue, validateForm } from '../../lib/utils/form'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthRequest, AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { ApiServiceSymbol, IApiService } from '../../services/api.service'
import { EmailCodeInput } from '../../models'
import { CODE_RESEND_TIMEOUT } from '../../common/constrants'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { breadcrumb } from '../../utils/breadcrumb'
import { screenAnalytics } from '../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../services/analytics/analytics.service'

const VERIFICATION_CODE_LENGTH = 5

@screenAnalytics(AnalyticsFlow.SignUp, AnalyticsScreen.EmailCode)
@breadcrumb('Email Code')
@injectable()
export class EmailCodeBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(AuthStoreSymbol) authStore!: IAuthStore

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get request() {
    return this.authStore.requests[AuthRequest.VerifyEmailCode]
  }

  @computed get codeLength() {
    return VERIFICATION_CODE_LENGTH
  }

  @computed get loading() {
    return this.request.pending
  }
  @computed get requestError() {
    return this.request.error
  }
  @observable touched = false

  @observable data: EmailCodeInput = {
    code: '',
  }
  @observable error: FormErrors<EmailCodeInput> = {}

  @computed get email() {
    return this.authStore.verifyEmail ?? 'error@error.com'
  }

  @observable resendAfter: Date
  @observable canResend: boolean

  constructor() {
    makeObservable(this)
    this.resetOnResent()

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )

    reaction(
      () => this.requestError,
      error => {
        this.error.code = error
        this.data.code = ''
      },
    )
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(EmailCodeSchema, this.data)
    }
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  onEdit() {
    this.navigationService.back()
  }

  @action onTimeOut() {
    this.canResend = true
  }

  @action resetOnResent() {
    this.canResend = false
    this.resendAfter = addSeconds(new Date(), CODE_RESEND_TIMEOUT)
  }

  @flow *onResend() {
    this.resetOnResent()

    this.authContext.resendEmailCode()
  }

  @flow *onVerify() {
    this.touched = true

    const isValid = yield isValidForm(EmailCodeSchema, this.data)
    if (!isValid) {
      return
    }

    this.authContext.verifyEmailCode(this.data.code)
  }

  onParamsChange(): void {
    // nothing to do here
  }

  onRequestClose(): boolean {
    this.authContext.editEmail()

    return true
  }
}

const EmailCodeSchema = yup.object().shape({
  code: yup.string().required().length(VERIFICATION_CODE_LENGTH).label('Code'),
})
