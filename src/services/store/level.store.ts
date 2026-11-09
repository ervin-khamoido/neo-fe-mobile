import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { cleanable, ICleanable } from '../../utils/sanitizer'

import { CurrentUserLevelInfo } from '../../models/level/current-user-level-info'
import { UserLevelDetails } from '../../models/level/user-level-details'
import { LevelOneRequirement, LevelRequirement, LevelZeroRequirement, UserLevel } from '../../models/level/definitions'
import { MainLevelOneNavigatorDef } from '../../screen/common'
import { ActionLimits, TransactionLimits } from '../../models'

export interface ILevelStore {
  readonly initialScreen: keyof MainLevelOneNavigatorDef
  setInitialScreen(value: keyof MainLevelOneNavigatorDef)

  readonly currentLevel: CurrentUserLevelInfo | null
  setCurrentLevel(value: CurrentUserLevelInfo): void

  readonly levelsDetails: UserLevelDetails[]
  setLevelsDetails(value: UserLevelDetails[]): void
  getLevelDetails(code: UserLevel): UserLevelDetails | null

  isRequirementRemaining(level: UserLevel.Level0, requirement: LevelZeroRequirement): boolean
  isRequirementRemaining(level: UserLevel.Level1, requirement: LevelOneRequirement): boolean

  readonly showLevelOneAck: boolean
  readonly isLevelOneAckSkippable: boolean
  readonly isBankAccountSkippable: boolean
  showLevelOneAckModal(isVisible: boolean, isSkippable: boolean, isBankAccountSkippable: boolean): void
  hideLevelOneAckModal(): void

  readonly version: number | null
  setVersion(value: number): void

  readonly currentLimits: ActionLimits | null
  setCurrentLimits(limits: ActionLimits): void

  readonly transactionLimits: TransactionLimits | null
  setTransactionLimits(limits: TransactionLimits): void
}

export const LevelStoreSymbol = Symbol.for('ILevelStore')

@cleanable
@injectable()
export class LevelStore implements ILevelStore, ICleanable {
  @observable initialScreen: keyof MainLevelOneNavigatorDef
  @observable currentLevel: CurrentUserLevelInfo | null = null
  @observable levelsDetails: UserLevelDetails[] = []

  @observable showLevelOneAck = false
  @observable isLevelOneAckSkippable = false
  @observable isBankAccountSkippable: boolean

  @observable version: number | null = null

  @observable currentLimits: ActionLimits | null = null
  @observable transactionLimits: TransactionLimits | null = null

  constructor() {
    makeObservable(this)
  }

  @action setCurrentLevel(value: CurrentUserLevelInfo): void {
    this.currentLevel = value
  }

  @action setLevelsDetails(value: UserLevelDetails[]): void {
    this.levelsDetails = value
  }

  getLevelDetails(code: UserLevel): UserLevelDetails | null {
    return this.levelsDetails.find(x => x.code === code) ?? null
  }

  // eslint
  isRequirementRemaining(level: UserLevel.Level0, requirement: LevelZeroRequirement): boolean
  isRequirementRemaining(level: UserLevel.Level1, requirement: LevelOneRequirement): boolean
  isRequirementRemaining(level: UserLevel, requirement: LevelRequirement): boolean {
    const levelDetails = this.getLevelDetails(level)

    return !!levelDetails.remainingRequirements.find(x => x.code === requirement)
  }

  @action setInitialScreen(value: keyof MainLevelOneNavigatorDef) {
    this.initialScreen = value
  }

  @action showLevelOneAckModal(isVisible: boolean, isSkippable: boolean, isBankAccountSkippable: boolean): void {
    this.showLevelOneAck = isVisible
    this.isLevelOneAckSkippable = isSkippable
    this.isBankAccountSkippable = isBankAccountSkippable
  }

  @action hideLevelOneAckModal(): void {
    this.showLevelOneAck = false
  }

  @action setVersion(value: number): void {
    this.version = value
  }

  @action setCurrentLimits(limits: ActionLimits): void {
    this.currentLimits = limits
  }

  @action setTransactionLimits(limits: TransactionLimits): void {
    this.transactionLimits = limits
  }

  @action clean(): void {
    this.currentLevel = null
    this.levelsDetails = []
    this.showLevelOneAck = false
    this.isLevelOneAckSkippable = false
    this.currentLimits = null
    this.transactionLimits = null
    this.version = null
  }
}
