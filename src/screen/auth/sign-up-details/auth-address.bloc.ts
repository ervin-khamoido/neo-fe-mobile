import { inject, injectable } from 'inversify'
import { action, computed, makeObservable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { SignUpNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { FormFieldName } from '../../../lib/utils/form'
import { ISignUpStore, SignUpStoreSymbol } from '../../../services/store/sign-up.store'
import { IInvitationStore, InvitationStoreSymbol } from '../../../services/store/invitation.store'
import { Country } from '../../../utils/country-state-city/typing'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.SignUp, AnalyticsScreen.Address)
@breadcrumb('AuthAddress')
@injectable()
export class AuthAddressBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<SignUpNavigatorDef>
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(SignUpStoreSymbol) signUpStore!: ISignUpStore
  @inject(InvitationStoreSymbol) invitationStore!: IInvitationStore

  @computed get data() {
    return this.signUpStore.data
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  onScreenFocus() {
    if (!this.signUpStore.data.address) {
      this.setAddressDefaultValues()
    }
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.signUpStore.set({ name: 'address', field: name }, value)
  }

  async onSkip() {
    this.signUpStore.set('address', null)
    await this.onSubmit()
  }

  async onSubmit() {
    const { invitationContext } = this.invitationStore

    if (invitationContext) {
      this.signUpStore.set('referrerCode', invitationContext.referrerCode)
      this.analyticsService.skipScreen(AnalyticsFlow.SignUp, AnalyticsScreen.Referrer, {
        referral_code: invitationContext.referrerCode,
      })

      this.navigationService.navigate('AuthUsername')
    } else {
      this.navigationService.navigate('Referrer')
    }
  }

  @action private setAddressDefaultValues() {
    this.signUpStore.data.address = {
      country: Country.NG,
      state: '',
      city: '',
      addressLine: '',
    }
  }
}
