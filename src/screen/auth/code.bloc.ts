import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'
import { addSeconds } from 'date-fns'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'
import { CODE_RESEND_TIMEOUT } from '../../common/constrants'
import { FormErrors, FormFieldName, isValidForm, setFormValue, validateForm } from '../../lib/utils/form'
import { CodeInput } from '../../models'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthRequest, AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { breadcrumb } from '../../utils/breadcrumb'
import { screenAnalytics } from '../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../services/analytics/analytics.service'

const VERIFICATION_CODE_LENGTH = 6

@screenAnalytics(AnalyticsFlow.Auth, AnalyticsScreen.PhoneCode)
@breadcrumb('Code')
@injectable()
export class CodeBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService

  @inject(AuthStoreSymbol) authStore!: IAuthStore

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @computed get request() {
    return this.authStore.requests[AuthRequest.VerifyCode]
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

  @computed get verifyPhone() {
    return this.authStore.verifyPhone
  }

  @computed get verifyPhoneType() {
    return this.authStore.verifyPhoneType
  }

  @observable touched = false
  @observable data: CodeInput = {
    code: '',
  }
  @observable error: FormErrors<CodeInput>

  @observable resendAfter: Date
  @observable canResend: boolean

  constructor() {
    makeObservable(this)
    this.resetOnResent()
    this.resetError()

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
        if (error) {
          this.error.code = error
          this.data.code = ''
        }
      },
    )
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(CodeInputSchema, this.data)
    }
  }

  @action resetError() {
    this.touched = false
    this.error = {
      code: '',
    }
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.resetError()
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

    this.authContext.resendCode()
  }

  @flow *onVerify() {
    this.touched = true
    const isValid = yield isValidForm(CodeInputSchema, this.data)
    if (!isValid) {
      return
    }

    this.authContext.verifyCode(this.data.code)
  }

  onParamsChange(): void {}

  onRequestClose(): boolean {
    this.authContext.editPhone()
    return true
  }
}

const CodeInputSchema = yup.object().shape({
  code: yup.string().length(VERIFICATION_CODE_LENGTH).min(0).max(99999).label('Code'),
})
