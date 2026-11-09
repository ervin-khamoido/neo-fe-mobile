import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'

import { ConnectionError, RequestError } from '@ts-awesome/request'

import { IBLoC } from '../../../ioc'
import { SignUpNavigatorDef } from '../../common'
import { FormErrors, FormFieldName, isValidForm, validateForm } from '../../../lib/utils/form'
import { ReferrerVerifyOutput, SignUpInput } from '../../../models'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'

import { IInvitationStore, InvitationStoreSymbol } from '../../../services/store/invitation.store'
import { IReferralService, ReferralServiceSymbol } from '../../../services/referral.service'

import { StatusCode } from '../../../common/constrants'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ISignUpStore, SignUpStoreSymbol } from '../../../services/store/sign-up.store'
import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@breadcrumb('Referrer')
@injectable()
export class ReferrerBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<SignUpNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(ReferralServiceSymbol) referralService!: IReferralService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  @inject(SignUpStoreSymbol) signUpStore!: ISignUpStore
  @inject(InvitationStoreSymbol) invitationStore!: IInvitationStore

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @observable loading = false
  @observable touched = false
  @observable isConfirmModalVisible = false

  @computed get data() {
    return this.signUpStore.data
  }

  @observable error: FormErrors<SignUpInput> = {}

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )

    const referrerCode = this.invitationStore.invitationContext?.referrerCode ?? ''
    this.signUpStore.set('referrerCode', referrerCode)
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(ReferrerSchema, this.data)
    }
  }

  @flow *onSubmit() {
    this.touched = true
    this.loading = true

    const isValid = yield isValidForm(ReferrerSchema, this.data)
    if (!isValid) {
      this.loading = false
      return
    }

    try {
      const result: ReferrerVerifyOutput = yield this.referralService.verifyReferrer(this.data.referrerCode)

      if (!result.verified) {
        this.error.referrerCode = result.reason
      } else {
        this.navigationService.navigate('AuthUsername')
      }
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else if (err instanceof RequestError && err.statusCode === StatusCode.ServerError) {
        this.toastService.error('Service Temporary Unavailable')
      } else if (err instanceof RequestError && err.statusCode === StatusCode.BadRequest) {
        this.error.referrerCode = `${err.message}`
      } else {
        this.monitoring.exception(err)
        this.authContext.registrationSessionExpired()
        this.toastService.error('Oops, something went wrong. Please, try registering again', 10000)
      }
    } finally {
      this.loading = false
    }
  }

  @flow *onSkip() {
    this.signUpStore.set('referrerCode', null)
    this.navigationService.navigate('AuthUsername')

    this.isConfirmModalVisible = false
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.signUpStore.set(name, value)
  }

  @action onModalOpen() {
    this.isConfirmModalVisible = true
  }

  @action onModalClose() {
    this.isConfirmModalVisible = false
  }

  onParamsChange() {
    // nothing to do here
  }

  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  private isBlurred = false

  onScreenFocus() {
    this.analyticsService.openScreen(AnalyticsFlow.SignUp, AnalyticsScreen.Referrer)
  }

  onScreenBlur() {
    this.isBlurred = true
    this.analyticsService.closeScreen(AnalyticsFlow.SignUp, AnalyticsScreen.Referrer, {
      referral_code: this.data.referrerCode,
    })
  }

  onDestroy() {
    if (!this.isBlurred) {
      this.analyticsService.closeScreen(AnalyticsFlow.SignUp, AnalyticsScreen.Referrer, {
        referral_code: this.data.referrerCode,
      })
    }
  }
}

const ReferrerSchema = yup.object().shape({
  referrerCode: yup.string().nullable().required('Please enter a valid referral code').label('Referral Code'),
})
