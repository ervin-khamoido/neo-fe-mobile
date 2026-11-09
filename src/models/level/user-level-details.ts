2021

import { readable } from '@ts-awesome/model-reader'
import {
  LevelOneRequirement,
  LevelStatus,
  LevelTwoRequirement,
  LevelZeroRequirement,
  StatusDetailsAction,
  UserLevel,
} from './definitions'

export class LevelRequirementInfo {
  @readable(String) code!: LevelZeroRequirement | LevelOneRequirement | LevelTwoRequirement
  @readable(String) description!: string
}

export class LevelBenefit {
  @readable(String) label!: string
  @readable(Object, true) value!: number | string | boolean | null
  @readable(String) formattedValue!: string
}

class StatusDetails {
  @readable(String) message!: string
  @readable(String) code!: string
  @readable(Object, true) actions?: Partial<Record<StatusDetailsAction, boolean>>
}

export class UserLevelDetails {
  @readable(Number) order!: number
  @readable(String) code!: UserLevel
  @readable(String) name!: string

  @readable(String) benefitsSummary!: string
  @readable([LevelBenefit]) benefits!: LevelBenefit[]

  @readable(String) requirementsSummary!: string
  @readable([LevelRequirementInfo]) requirements!: LevelRequirementInfo[]
  @readable([LevelRequirementInfo]) remainingRequirements!: LevelRequirementInfo[]

  @readable(String) status!: LevelStatus
  @readable(StatusDetails, true) statusDetails?: StatusDetails | null
}
