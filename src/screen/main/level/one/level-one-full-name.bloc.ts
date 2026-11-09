import { inject, injectable, named } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'
import { MainLevelOneNavigatorDef } from '../../../common'
import { StatusCode } from '../../../../common/constrants'
import { FormFieldName, setFormValue } from '../../../../lib/utils/form'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../../services/level/level-one.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { FullNameInput } from '../../../auth/sign-up-details/widget/full-name.bloc'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.FullName)
@breadcrumb('Level One Full Name')
@injectable()
export class LevelOneFullNameBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('LevelOneFullNameBLoC') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainLevelOneNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @observable loading = false

  @observable data: FullNameInput = {
    firstName: '',
    middleName: '',
    lastName: '',
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  @flow *onSubmit() {
    try {
      yield this.userService.createFullName(this.data.firstName, this.data.lastName, this.data.middleName)
      yield this.userService.syncMe()

      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.FullName, {
        status: 'success',
      })

      this.levelOneService.nextFlowStep()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.FullName, {
        status: 'failure',
      })
      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable')
      } else if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.Conflict:
            // all good. the full name for the current user is set, so let silently go to the next step or end the flow.
            this.levelOneService.nextFlowStep()
            break
          case StatusCode.BadRequest:
            // propagate the error. the widget will handle it
            throw err
          default:
            this.monitoring.exception(err)
            this.toast.error('Service temporary unavailable')
        }
      } else {
        this.monitoring.exception(err)
        this.toast.error('Service temporary unavailable')
      }
    }
  }
}
