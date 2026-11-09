import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { breadcrumb } from '../../../utils/breadcrumb'
import { LevelBenefit, UserLevelDetails } from '../../../models/level/user-level-details'
import { LevelStatus, LevelTwoRequirement, UserLevel } from '../../../models/level/definitions'
import { LevelFlowInterruptError } from '../../../models/error/level-flow-interrupt.error'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../services/level/level-one.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'

import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { ILevelTwoService, LevelTwoServiceSymbol } from '../../../services/level/level-two.service'
import { ILevelFlowService, LevelFlowServiceSymbol } from '../../../services/level/level-flow.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import { screenAnalytics } from '../../../utils/screen-analytics'

@screenAnalytics(AnalyticsFlow.Account, AnalyticsScreen.Account_Level)
@breadcrumb('Account Level')
@injectable()
export class AccountLevelBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(LevelTwoServiceSymbol) levelTwoService!: ILevelTwoService
  @inject(LevelFlowServiceSymbol) levelFlowService!: ILevelFlowService

  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @observable loading = false

  @computed get isFullyVerified() {
    const {
      currentLevel: { next },
    } = this.levelStore

    return !next
  }

  @computed get progress() {
    const allRequirementsCount = this.levelDetails.reduce((res, curr) => res + curr.requirements.length, 0)
    const remainingRequirementsCount = this.levelDetails.reduce(
      (res, curr) => res + curr.remainingRequirements.length,
      0,
    )

    return allRequirementsCount ? (allRequirementsCount - remainingRequirementsCount) / allRequirementsCount : 0
  }

  @computed get displayProgress() {
    return `${Math.floor(this.progress * 100)}%`
  }

  @computed get displayNextRequirement() {
    const { remainingRequirements } = this.nextLevelDetails

    if (remainingRequirements.length === 0) {
      return null
    } else {
      if (remainingRequirements[0].code === LevelTwoRequirement.KYCProviderVerification_KYCLevel2) {
        return 'Upgrade Account'
      }

      return remainingRequirements[0].description
    }
  }

  @computed get isNextRequirementInactive() {
    const { status } = this.nextLevelDetails

    return status === LevelStatus.Pending
  }

  @computed get currentBenefits(): LevelBenefit[] {
    return this.currentLevelDetails?.benefits ?? []
  }

  @computed get currentLevel() {
    return this.levelStore.currentLevel
  }

  @computed get currentLevelDetails(): UserLevelDetails | undefined {
    const {
      currentLevel: { current },
    } = this.levelStore

    return this.levelDetails.find(x => x.code === current.code)
  }

  @computed get nextLevelDetails(): UserLevelDetails | undefined {
    const {
      currentLevel: { next },
    } = this.levelStore

    return this.levelDetails.find(x => x.code === next?.code)
  }

  @computed get levelDetails(): UserLevelDetails[] {
    return this.levelStore.levelsDetails.filter(x => x.code !== UserLevel.Level0)
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onRequirement() {
    this.analyticsService.tap(AnalyticsFlow.Account, AnalyticsScreen.Account_Level, {
      tag: 'kyc_level_upgrade',
    })

    try {
      this.loading = true

      yield this.levelFlowService.triggerNextLevelFlowSync()
    } catch (err) {
      if (err instanceof LevelFlowInterruptError) {
        // shouldn't be handled
        return
      }

      this.toast.error(err.message)
    } finally {
      this.loading = false
    }
  }
}
