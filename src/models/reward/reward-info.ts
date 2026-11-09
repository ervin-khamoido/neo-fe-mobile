import { readable } from '@ts-awesome/model-reader'
import { Activity } from '../activity'
import { CurrencyType } from '../user-settings'

export class RewardActivityListOutput {
  @readable([Activity]) activities!: Activity[]
  @readable(Number, true) nextCursor!: number | null
  @readable(Number) pageSize!: number
}

export class RewardTotalsOutput {
  @readable(Number) totalEarned!: number
  @readable(Number) totalEarnedCurrentMonth!: number
  @readable(String) currency!: CurrencyType
  @readable(String) currentMonth!: string
}

export class RewardsSummaryOutput {
  @readable(RewardTotalsOutput) yieldTotals!: RewardTotalsOutput
  @readable(RewardTotalsOutput) cashbackBuyTotals!: RewardTotalsOutput
  @readable(RewardTotalsOutput) referralTotals!: RewardTotalsOutput
  @readable(RewardTotalsOutput) promotionCampaignTotals!: RewardTotalsOutput
}
