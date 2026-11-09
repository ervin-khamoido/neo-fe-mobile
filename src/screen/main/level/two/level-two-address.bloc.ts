import { inject, injectable, named } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'
import { MainLevelTwoNavigatorDef } from '../../../common'
import { StatusCode } from '../../../../common/constrants'
import { FormFieldName, setFormValue } from '../../../../lib/utils/form'
import { IAddress } from '../../../../models'
import { Country } from '../../../../utils/country-state-city/typing'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { ILevelTwoService, LevelTwoServiceSymbol } from '../../../../services/level/level-two.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.Address)
@breadcrumb('Level Two Address')
@injectable()
export class LevelTwoAddressBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('LevelTwoAddressBLoC') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainLevelTwoNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelTwoServiceSymbol) levelTwoService!: ILevelTwoService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @observable loading = false

  @observable data: IAddress = {
    country: Country.NG,
    state: '',
    city: '',
    addressLine: '',
    comment: null,
    postalCode: null,
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
      yield this.userService.createAddress(this.data)

      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.Address, {
        status: 'success',
      })

      this.levelTwoService.nextFlowStep()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.Address, {
        status: 'failure',
      })
      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable')
      } else if (err instanceof RequestError) {
        switch (err.statusCode) {
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
