import { inject, injectable, named } from 'inversify'

import { MainLevelOneNavigatorDef, MainNavigatorDef } from '../../screen/common'
import { LevelFlowInterruptError } from '../../models/error/level-flow-interrupt.error'
import { LevelOneRequirement, UserLevel } from '../../models/level/definitions'

import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { IUserService, UserServiceSymbol } from '../user.service'

import { ILevelStore, LevelStoreSymbol } from '../store/level.store'
import { ILevelService, LevelServiceSymbol } from './level.service'

export interface ILevelOneService {
  triggerFlowWithoutAck(): Promise<void>
  triggerFlow(skippable?: boolean, skipBankAccount?: boolean): Promise<void>
  nextFlowStep(initial?: true): void
  interruptFlow(): void
  waitCurrentFlow(): Promise<void>
}

export const LevelOneServiceSymbol = Symbol.for('ILevelOneService')

@injectable()
export class LevelOneService implements ILevelOneService {
  @inject(AppMonitoringServiceSymbol) @named('LevelOneService') monitoring!: IMonitoringService

  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>
  @inject(NavigationServiceSymbol) levelOneNavigation!: INavigationService<MainLevelOneNavigatorDef>

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(LevelServiceSymbol) levelService!: ILevelService

  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  private flowPromise: Promise<void> | null
  private flowResolver: { resolve: () => void; reject: (err: Error) => void } | null = null

  async triggerFlowWithoutAck(): Promise<void> {
    await this.triggerFlow(false, false, true)
  }

  async triggerFlow(skippable?: boolean, skipBankAccount?: boolean, skipAck = false): Promise<void> {
    if (this.flowResolver) {
      this.monitoring.exception('critical: Level One flow is in progress')
      return
    }

    // sync with server-side before triggering the flow
    await Promise.all([this.levelService.syncCurrentLevel(), this.levelService.syncLevelsDetails()])

    const { currentLevel } = this.levelStore
    if (currentLevel.next?.code !== UserLevel.Level1) {
      return
    }

    const levelDetails = this.levelStore.getLevelDetails(UserLevel.Level1)
    // no data found for level_1
    // critical error -> the flow can't be started
    if (!levelDetails) {
      this.monitoring.exception('critical: level_1 details where not found')
      return
    }

    const { remainingRequirements: reqs } = levelDetails
    if (skipBankAccount) {
      const hasExactlyOneRequirementLeft = reqs.length === 1
      const hasBankAccountRequirementLeft = reqs.find(x => x.code === LevelOneRequirement.BankAccount)

      if (hasExactlyOneRequirementLeft && hasBankAccountRequirementLeft) {
        return
      }
    }

    if (skipAck) {
      this.nextFlowStep(true)
    } else {
      this.levelStore.showLevelOneAckModal(true, !!skippable, !!skipBankAccount)
    }

    this.flowPromise = new Promise((resolve, reject) => {
      this.flowResolver = { resolve, reject }
    })
  }

  nextFlowStep(initial?: true): void {
    setImmediate(() => this.processNextRequirement(initial))
  }

  interruptFlow(): void {
    if (!this.flowResolver) {
      return
    }

    this.finishFlow(new LevelFlowInterruptError())
  }

  waitCurrentFlow(): Promise<void> {
    return this.flowPromise ?? Promise.resolve()
  }

  private finishFlow(err?: Error): void {
    if (err) {
      this.flowResolver.reject(err)
    } else {
      this.flowResolver.resolve()
    }

    this.flowPromise = null
    this.flowResolver = null
  }

  private async processNextRequirement(initial?: true): Promise<void> {
    if (!this.flowResolver) {
      this.monitoring.exception(`critical: the Level One flow haven't been started, yet`)
      return this.finishFlow(new Error('Something went wrong. Please, try again later'))
    }

    // sync with server-side before triggering the screens
    // initially the data is sync in triggerFlow
    if (!initial) {
      try {
        await Promise.all([this.levelService.syncCurrentLevel(), this.levelService.syncLevelsDetails()])
      } catch (err) {
        return this.finishFlow(err)
      }
    }

    const { currentLevel, isBankAccountSkippable } = this.levelStore
    // no data pulled from the server
    // critical error -> the flow can't be started
    if (!currentLevel) {
      return this.finishFlow(new Error('Something went wrong. Please, try again later'))
    }

    // next level is undefined or the next level isn't a level_1
    // the level one is not required -> the flow is finished
    if (!currentLevel.next || currentLevel.next.code !== UserLevel.Level1) {
      return this.finishFlow()
    }

    const levelDetails = this.levelStore.getLevelDetails(UserLevel.Level1)
    // no data found for level_1
    // critical error -> the flow can't be started
    if (!levelDetails) {
      this.monitoring.exception('critical: level_1 details where not found')
      this.finishFlow(new Error('Something went wrong. Please, try again later'))
      return
    }

    // no remaining requirements found for level_1 but currentLevel.next is Level1
    // the inconstant state is a critical error -> the flow can't be started
    if (levelDetails.remainingRequirements.length === 0) {
      this.monitoring.exception('critical: the remaining requirements in level_1 are missing')
      this.finishFlow(new Error('Something went wrong. Please, try again later'))
      return
    }

    let firstRequirement = levelDetails.remainingRequirements[0]
    if (isBankAccountSkippable) {
      const isNextRequirementBankAccount = firstRequirement.code === LevelOneRequirement.BankAccount
      const isTheLastRequirement = levelDetails.remainingRequirements.length === 1

      if (isNextRequirementBankAccount && isTheLastRequirement) {
        this.finishFlow()
        return
      } else if (isNextRequirementBankAccount) {
        firstRequirement = levelDetails.remainingRequirements[1]
      }
    }

    switch (firstRequirement.code as LevelOneRequirement) {
      case LevelOneRequirement.PersonalInfo_FullName:
        if (initial) {
          this.levelStore.setInitialScreen('LevelOneFullName')
          this.navigation.navigate('LevelOne')
        } else {
          this.levelOneNavigation.replace('LevelOneFullName')
        }
        return
      case LevelOneRequirement.PersonalInfo_DoB:
        if (initial) {
          this.levelStore.setInitialScreen('LevelOneDoB')
          this.navigation.navigate('LevelOne')
        } else {
          this.levelOneNavigation.replace('LevelOneDoB')
        }
        return
      case LevelOneRequirement.BankAccount:
        if (initial) {
          this.levelStore.setInitialScreen('LevelOneBankAccount')
          this.navigation.navigate('LevelOne')
        } else {
          this.levelOneNavigation.replace('LevelOneBankAccount')
        }
        return
      default:
        this.monitoring.exception(`An unknown requirement code is received from the API: ${firstRequirement.code}`)
        this.finishFlow(new Error('Something went wrong. Please, try again later'))
        return
    }
  }
}
