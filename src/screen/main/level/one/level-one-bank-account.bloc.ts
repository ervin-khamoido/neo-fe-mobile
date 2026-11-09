import { inject, injectable, named } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'

import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'
import { MainLevelOneNavigatorDef } from '../../../common'
import { FormFieldName, setFormValue } from '../../../../lib/utils/form'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { IUserService, UserServiceSymbol } from '../../../../services/user.service'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../../services/level/level-one.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.BankAccount)
@breadcrumb('Level One Bank Account')
@injectable()
export class LevelOneBankAccountBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('LevelOneBankAccountBLoC') monitoring!: IMonitoringService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainLevelOneNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService

  @observable loading = false

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
    this.levelOneService.nextFlowStep()
  }
}
