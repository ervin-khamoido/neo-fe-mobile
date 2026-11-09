import { inject, injectable, named } from 'inversify'

import { MainLevelTwoNavigatorDef, MainNavigatorDef } from '../../screen/common'
import { LevelFlowInterruptError } from '../../models/error/level-flow-interrupt.error'
import { LevelTwoRequirement, UserLevel } from '../../models/level/definitions'

import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { IUserService, UserServiceSymbol } from '../user.service'

import { ILevelStore, LevelStoreSymbol } from '../store/level.store'
import { ILevelService, LevelServiceSymbol } from './level.service'
import { ISumsubService, SumsubServiceSymbol } from '../sumsub.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../analytics/analytics.service'

export interface ILevelTwoService {
  readonly isInternalFlowPending: boolean

  triggerFlow(): Promise<void>
  nextFlowStep(): void

  waitCurrentFlow(): Promise<void>

  interruptFlow(): void
  waitInternalFlow(): Promise<void>
}

export const LevelTwoServiceSymbol = Symbol.for('ILevelTwoService')

@injectable()
export class LevelTwoService implements ILevelTwoService {
  @inject(AppMonitoringServiceSymbol) @named('LevelTwoService') monitoring!: IMonitoringService

  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>
  @inject(NavigationServiceSymbol) levelTwoNavigation!: INavigationService<MainLevelTwoNavigatorDef>

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(SumsubServiceSymbol) sumsubService!: ISumsubService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  private internalFlowPromise: Promise<void> | null
  private internalFlowResolver: { resolve: () => void; reject: (err: Error) => void } | null = null

  private flowPromise: Promise<void> | null
  private flowResolver: { resolve: () => void; reject: (err: Error) => void } | null = null

  get isInternalFlowPending(): boolean {
    return !!this.internalFlowResolver
  }

  async triggerFlow(): Promise<void> {
    if (this.flowResolver) {
      this.monitoring.exception('critical: Level Two flow is in progress')
      return
    }

    // sync with server-side before triggering the flow
    await Promise.all([this.levelService.syncCurrentLevel(), this.levelService.syncLevelsDetails()])

    const { currentLevel } = this.levelStore
    if (currentLevel.next?.code !== UserLevel.Level2) {
      return
    }

    const { remainingRequirements } = this.levelStore.getLevelDetails(UserLevel.Level2)
    const hasAtLeastOneInternalRequirement = remainingRequirements.find(x => x.code.startsWith('internal'))
    if (hasAtLeastOneInternalRequirement) {
      this.internalFlowPromise = new Promise((resolve, reject) => {
        this.internalFlowResolver = { resolve, reject }
      })
    }

    this.nextFlowStep()

    this.flowPromise = new Promise((resolve, reject) => {
      this.flowResolver = { resolve, reject }
    })
  }

  nextFlowStep(): void {
    setImmediate(() => this.processNextRequirement())
  }

  interruptFlow(): void {
    this.finishFlow(new LevelFlowInterruptError())
  }

  waitCurrentFlow(): Promise<void> {
    return this.flowPromise ?? Promise.resolve()
  }

  waitInternalFlow(): Promise<void> {
    return this.internalFlowPromise ?? Promise.resolve()
  }

  private finishInternalFlow(err?: Error) {
    if (err) {
      this.internalFlowResolver?.reject(err)
    } else {
      this.internalFlowResolver?.resolve()
    }

    this.internalFlowPromise = null
    this.internalFlowResolver = null
  }

  private finishFlow(err?: Error): void {
    this.finishInternalFlow(err)

    if (err) {
      this.flowResolver?.reject(err)
    } else {
      this.flowResolver?.resolve()
    }

    this.flowPromise = null
    this.flowResolver = null
  }

  private async processNextRequirement(): Promise<void> {
    if (!this.flowResolver) {
      this.monitoring.exception(`critical: the Level Two flow haven't been started, yet`)
      return this.finishFlow(new Error('Something went wrong. Please, try again later'))
    }

    // sync with server-side before triggering the screens
    // initially the data is sync in triggerFlow
    try {
      await Promise.all([this.levelService.syncCurrentLevel(), this.levelService.syncLevelsDetails()])
    } catch (err) {
      return this.finishFlow(err)
    }

    const { currentLevel } = this.levelStore
    // no data pulled from the server
    // critical error -> the flow can't be started
    if (!currentLevel) {
      return this.finishFlow(new Error('Something went wrong. Please, try again later'))
    }

    // next level is undefined or the next level isn't a level_1
    // the level one is not required -> the flow is finished
    if (!currentLevel.next || currentLevel.next.code !== UserLevel.Level2) {
      return this.finishFlow()
    }

    const levelDetails = this.levelStore.getLevelDetails(UserLevel.Level2)
    // no data found for level_1
    // critical error -> the flow can't be started
    if (!levelDetails) {
      this.monitoring.exception('critical: level_2 details where not found')
      this.finishFlow(new Error('Something went wrong. Please, try again later'))
      return
    }

    // no remaining requirements found for level_1 but currentLevel.next is Level1
    // the inconstant state is a critical error -> the flow can't be started
    if (levelDetails.remainingRequirements.length === 0) {
      this.monitoring.exception('critical: the remaining requirements in level_2 are missing')
      this.finishFlow(new Error('Something went wrong. Please, try again later'))
      return
    }

    const hasAtLeastOneInternalRequirement = levelDetails.remainingRequirements.find(x => x.code.startsWith('internal'))
    if (!hasAtLeastOneInternalRequirement) {
      this.finishInternalFlow()
    }

    let firstRequirement = levelDetails.remainingRequirements[0]
    switch (firstRequirement.code as LevelTwoRequirement) {
      case LevelTwoRequirement.PersonalInfo_Address:
        this.navigation.navigate('LevelTwo')
        return
      case LevelTwoRequirement.KYCProviderVerification_KYCLevel2:
        // trigger external flow
        setImmediate(() => this.startExternalFlow())
        return
      default:
        this.monitoring.exception(`An unknown requirement code is received from the API: ${firstRequirement.code}`)
        this.finishFlow(new Error('Something went wrong. Please, try again later'))
        return
    }
  }

  private async startExternalFlow() {
    try {
      this.analyticsService.openScreen(AnalyticsFlow.KYC, AnalyticsScreen.KYC_ProviderVerification)
      await this.sumsubService.launch()

      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.KYC_ProviderVerification, {
        status: 'success',
      })
      this.finishFlow()
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.KYC, AnalyticsScreen.KYC_ProviderVerification, {
        status: 'failure',
      })
      this.finishFlow(err)
    } finally {
      this.analyticsService.closeScreen(AnalyticsFlow.KYC, AnalyticsScreen.KYC_ProviderVerification)
    }
  }
}
