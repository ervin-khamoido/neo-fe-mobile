import { inject, injectable } from 'inversify'
import { action, computed, makeObservable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { SignUpNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { FormFieldName } from '../../../lib/utils/form'
import { ISignUpStore, SignUpStoreSymbol } from '../../../services/store/sign-up.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.SignUp, AnalyticsScreen.FullName)
@breadcrumb('AuthFullName')
@injectable()
export class AuthFullNameBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<SignUpNavigatorDef>

  @inject(SignUpStoreSymbol) signUpStore!: ISignUpStore

  @computed get data() {
    return this.signUpStore.data
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.signUpStore.set(name, value)
  }

  async onSubmit() {
    this.navigationService.navigate('AuthDoB')
  }
}
