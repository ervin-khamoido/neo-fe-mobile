import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { StatusCode } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IssueCardInput } from '../../../models/input/issue-card.input'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { ApiServiceSymbol, IApiService } from '../../../services/api.service'
import { CardServiceSymbol, ICardService } from '../../../services/card.service'

import { IAuthContext } from '../../../services/context/auth/interfaces'
import { AuthContextSymbol } from '../../../services/context/auth'
import { isServerError } from '../../../utils/helpers'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Card, AnalyticsScreen.Card_BVN)
@breadcrumb('Bvn')
@injectable()
export class BvnBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(CardServiceSymbol) cardService!: ICardService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @observable loading = false
  @observable error: string | null = null

  @observable data: IssueCardInput = {
    bvn: '',
  }

  @computed get isContinueBtnDisabled() {
    return this.loading || !this.data?.bvn || this.data?.bvn.length < 11
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onChange<T>(value: string) {
    this.error = null
    this.data.bvn = value.replace(/\D/g, '')
  }

  @flow *onSubmit() {
    this.loading = true

    try {
      yield this.cardService.issueVirtualCard(this.data)
      this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_BVN, {
        status: 'success',
      })

      this.toast.success('BVN has been added')
      this.navigationService.back()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.Card, AnalyticsScreen.Card_BVN, {
        status: 'failure',
      })

      if (err instanceof ConnectionError) {
        this.toast.error('Services Temporarily Unavailable')
      } else if (err instanceof RequestError) {
        if (err.statusCode === StatusCode.BadRequest) {
          this.error = err.message
        } else if (isServerError(err.statusCode)) {
          this.toast.error('Services Temporarily Unavailable')
        } else {
          this.toast.error('Oops, something went wrong. Please, try again', 10000)
        }
      }
    } finally {
      this.loading = false
    }
  }
}
