import { readable } from '@ts-awesome/model-reader'

class ReferrerInfoRewardDetailsOutput {
  @readable(Boolean) isActive!: boolean
  @readable(String, true) shortReferralRewardInfo!: string | null
  @readable(String, true) referrerPayoutFormatted?: string | null
  @readable(String, true) minRefereeSaveAmountUsdcFormatted?: string | null
}

export class ReferrerInfo {
  @readable(String) referralCode!: string
  @readable(String) referralLink!: string
  @readable(String) referralConditions!: string
  @readable(String) invitationText!: string
  @readable(ReferrerInfoRewardDetailsOutput, true) rewardDetails?: ReferrerInfoRewardDetailsOutput
}
