import React from 'react'
import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import RNPhoneInput from 'react-native-phone-input/dist'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'
import { FormErrors, FormFieldName, setFormValue } from '../../lib/utils/form'

import { AuthRequest, AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'
import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { ApiServiceSymbol, IApiService, PhoneVerificationType } from '../../services/api.service'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { breadcrumb } from '../../utils/breadcrumb'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { RemoteConfig } from '../../services/remote-config.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../services/analytics/analytics.service'
import { screenAnalytics } from '../../utils/screen-analytics'

const MAX_PHONE_NUMBER_LENGTH = 1 + 3 + 10

type PhoneInput = { phone: string; type: PhoneVerificationType }

@screenAnalytics(AnalyticsFlow.Auth, AnalyticsScreen.Phone)
@breadcrumb('Phone')
@injectable()
export class PhoneBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @inject(AuthContextSymbol) authContext!: IAuthContext
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @computed get whatsappVerificationActive() {
    return !!this.appConfigStore.remoteConfig[RemoteConfig.PhoneVerificationWhatsapp]
  }

  @computed get request() {
    return this.authStore.requests[AuthRequest.SendCode]
  }

  @computed get loading() {
    return this.request.pending
  }
  @computed get requestError() {
    return this.request.error
  }

  @observable data: PhoneInput = {
    phone: '+234',
    type: PhoneVerificationType.SMS,
  }
  @observable error: FormErrors<PhoneInput> = {}

  phoneRef = React.createRef<RNPhoneInput>()

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.data.phone = '+234'
    this.data.type = this.whatsappVerificationActive ? PhoneVerificationType.WhatsApp : PhoneVerificationType.SMS

    reaction(
      () => this.requestError,
      error => {
        if (error) {
          this.error.phone = error
        }
      },
    )
  }

  @action onPhoneChange(name: FormFieldName, value: string) {
    if (value) {
      const phone = this.phoneRef.current.getValue()

      value = phone.slice(0, MAX_PHONE_NUMBER_LENGTH)
      this.phoneRef.current.setValue(value)
    }

    setFormValue(this, { name: 'data', field: name }, value)
  }

  @action onPhoneVerification(type: PhoneVerificationType): void {
    setFormValue(this, { name: 'data', field: 'type' }, type)
  }

  @flow *onSignIn() {
    this.analyticsService.selectOption(AnalyticsFlow.Auth, AnalyticsScreen.Phone, {
      option: this.data.type,
    })
    this.authContext.sendCode(this.data.phone, this.data.type)
  }

  onParamsChange() {
    // nothing to do here
  }
}
