import { inject, injectable, named } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'
import { MainLevelOneNavigatorDef } from '../../../common'
import { StatusCode } from '../../../../common/constrants'
import { FormFieldName, setFormValue } from '../../../../lib/utils/form'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { IUserService, UserServiceSymbol } from '../../../../services/user.service'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../../services/level/level-one.service'
import { DoBInput } from '../../../auth/sign-up-details/widget/dob.bloc'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'
import { differenceInCalendarDays } from 'date-fns'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.DoB)
@breadcrumb('Level One DoB')
@injectable()
export class LevelOneDoBBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('LevelOneDoBBLoC') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainLevelOneNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @observable loading = false

  @observable data: DoBInput = {
    dateOfBirth: null,
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
      yield this.userService.createDoB(this.data.dateOfBirth)

      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.DoB, {
        age: differenceInCalendarDays(new Date(), this.data.dateOfBirth),
        status: 'success',
      })

      this.levelOneService.nextFlowStep()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.DoB, {
        age: differenceInCalendarDays(new Date(), this.data.dateOfBirth),
        status: 'failure',
      })

      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable')
      } else if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.Conflict:
            // all good. the date of birth for the current user is set, so let silently go to the next step or end the flow.
            this.levelOneService.nextFlowStep()
            break
          case StatusCode.BadRequest:
            // propagate the error. the widget has to handle it
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
