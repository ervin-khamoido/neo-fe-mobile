import { computed, makeObservable } from 'mobx'
import { inject, injectable } from 'inversify'

import { LevelFlowInterruptError } from '../../../../models/error/level-flow-interrupt.error'
import { MainLevelOneNavigatorDef, MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { IBLoC } from '../../../../ioc'

import { ILevelStore, LevelStoreSymbol } from '../../../../services/store/level.store'
import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { ILevelTwoService, LevelTwoServiceSymbol } from '../../../../services/level/level-two.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.KYC, AnalyticsScreen.KYC_LevelTwo)
@breadcrumb('Level Two')
@injectable()
export class LevelTwoBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>

  @inject(LevelTwoServiceSymbol) levelTwoService!: ILevelTwoService
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
      await this.levelTwoService.waitInternalFlow()
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
    if (this.levelTwoService.isInternalFlowPending) {
      this.levelTwoService.interruptFlow()
    }
  }
}
