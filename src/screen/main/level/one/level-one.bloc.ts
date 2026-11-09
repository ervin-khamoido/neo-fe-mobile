import { computed, makeObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { MainLevelOneNavigatorDef, MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'

import { ILevelStore, LevelStoreSymbol } from '../../../../services/store/level.store'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../../services/level/level-one.service'
import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { LevelFlowInterruptError } from '../../../../models/error/level-flow-interrupt.error'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.KYC_LevelOne)
@breadcrumb('Level One')
@injectable()
export class LevelOneBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  @computed get initialScreen(): keyof MainLevelOneNavigatorDef {
    return this.levelStore.initialScreen
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  async initialize() {
    try {
      await this.levelOneService.waitCurrentFlow()
      this.navigation.back()
    } catch (err) {
      if (err instanceof LevelFlowInterruptError) {
        // nothing to do here
      } else {
        this.navigation.back()
      }
    }
  }

  onParamsChange() {
    // nothing to do here
  }

  onDestroy() {
    this.levelOneService.interruptFlow()
  }
}
