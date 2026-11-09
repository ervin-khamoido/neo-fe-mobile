import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { ConnectionError } from '@ts-awesome/request'

import { IBLoC } from '../../../ioc'
import { AuthNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'
import { InvalidUsernameError } from '../../../models/error/invalid-username.error'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { ISignUpStore, SignUpStoreSymbol } from '../../../services/store/sign-up.store'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { FormFieldName } from '../../../lib/utils/form'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.SignUp, AnalyticsScreen.NeobankTag)
@breadcrumb('AuthUsername')
@injectable()
export class AuthUsernameBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(SignUpStoreSymbol) signUpStore!: ISignUpStore

  @inject(AuthContextSymbol) context!: IAuthContext

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
    try {
      await this.api.validateUsername(this.data.username)

      this.context.signUp()
    } catch (err) {
      if (err instanceof InvalidUsernameError) {
        throw err
      } else if (err instanceof ConnectionError) {
        this.toast.error('Services Temporarily Unavailable')
      } else {
        this.context.registrationSessionExpired()
        this.toast.error('Oops, something went wrong. Please, try registering again', 10000)
      }
    }
  }
}
