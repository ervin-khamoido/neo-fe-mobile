import { readable } from '@ts-awesome/model-reader'
import { UserLevel } from './definitions'

export class UserLevelLimitOutput {
  @readable(Number, true) buy1DayLimitUsdc?: number | null
  @readable(Number, true) buy7DayLimitUsdc?: number | null
  @readable(Number, true) buy30DayLimitUsdc?: number | null

  @readable(Number, true) sell1DayLimitUsdc?: number | null
  @readable(Number, true) sell7DayLimitUsdc?: number | null
  @readable(Number, true) sell30DayLimitUsdc?: number | null

  @readable(Number, true) send1DayLimitUsdc?: number | null
  @readable(Number, true) send7DayLimitUsdc?: number | null
  @readable(Number, true) send30DayLimitUsdc?: number | null

  @readable(Number, true) receive1DayLimitUsdc?: number | null
  @readable(Number, true) receive7DayLimitUsdc?: number | null
  @readable(Number, true) receive30DayLimitUsdc?: number | null

  @readable(Number, true) combinedTurnoverLimitUsdc?: number | null
}

export class UserLevelInfo {
  @readable(String) code!: UserLevel
  @readable(String) label!: string
  @readable(String) message!: string
}

export class CurrentUserLevelInfo {
  @readable(UserLevelInfo) current!: UserLevelInfo
  @readable(UserLevelInfo, true) next?: UserLevelInfo | null
  @readable(UserLevelLimitOutput, true) limits?: UserLevelLimitOutput | null
}
