import { inject, injectable } from 'inversify'
import { action, flow, makeObservable } from 'mobx'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { breadcrumb } from '../../utils/breadcrumb'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../services/analytics/analytics.service'
import { screenAnalytics } from '../../utils/screen-analytics'

@screenAnalytics(AnalyticsFlow.Auth, AnalyticsScreen.RegisterOrSignIn)
@breadcrumb('RegisterOrSignIn')
@injectable()
export class RegisterOrSignInBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>

  @inject(AuthContextSymbol) authContext!: IAuthContext
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {}

  @flow *onSignIn() {
    this.navigationService.navigate('SignInOptions')
  }

  @flow *onRegister() {
    this.authContext.signInOrSignUpWithPhone()
  }

  onParamsChange() {
    // nothing to do here
  }
}
