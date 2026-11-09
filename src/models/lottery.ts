import { readable } from '@ts-awesome/model-reader'

export class LotteryDraw {
  @readable(String) uid!: string
  @readable(Number) grandPrizeUsdc!: number
  @readable(Number) totalRegularPrizeUsdc!: number
  @readable(Number) minRegularPrizeUsdc!: number
  @readable(Number) maxRegularPrizeUsdc!: number
  @readable(Date) drawAt!: Date
  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}

export class Lottery {
  @readable(String) uid!: string
  @readable(String) name!: string
  @readable(String) description!: string
  @readable(Number) maxGrandPriceUsdc!: number
  @readable(LotteryDraw, true) nextDraw?: LotteryDraw
  @readable(Number) totalTickets!: number
  @readable(Number) totalLocked!: number
  @readable(Date) updatedAt!: Date
  @readable(Date) createdAt!: Date
}

export class LotteryWinner {
  @readable(Number) amountUsdc!: number
  @readable(Date, true) rewardPayoutAt!: Date | null

  @readable(Lottery) lottery!: Lottery
  @readable(LotteryDraw) lotteryDraw!: LotteryDraw
}
