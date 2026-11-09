import { Lottery, LotteryWinner } from '../../models'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

export interface ILotteryStore {
  readonly lottery: Lottery
  readonly pending: boolean

  setLottery(lottery: Lottery): void
  setPending(value: boolean): void

  readonly lotteryVersion: number
  readonly latestLotteryDrawUid: string | null
  readonly latestLotteryDrawResultsSeen: boolean
  setLotteryVersion(value: number, lotteryDrawUid: string): void
  setLatestLotteryDrawResultsSeen(value: boolean): void

  readonly userLotteryVersion: number
  setUserLotteryVersion(value: number): void

  readonly lotteryWinner: LotteryWinner | null
  setLotteryWinner(value: LotteryWinner | null): void
}

export const LotteryStoreSymbol = Symbol.for('ILotteryStore')

@cleanable
@injectable()
export class LotteryStore implements ILotteryStore, ICleanable {
  @observable lottery: Lottery | null = null
  @observable pending: boolean = true
  @observable lotteryVersion: number = -1
  @observable latestLotteryDrawUid: string | null = null
  @observable userLotteryVersion: number = -1
  @observable lotteryWinner: LotteryWinner | null = null
  @observable latestLotteryDrawResultsSeen: boolean = true

  constructor() {
    makeObservable(this)
  }

  @action setLottery(lottery: Lottery) {
    this.lottery = lottery
  }

  @action setPending(value: boolean) {
    this.pending = value
  }

  @action setLotteryVersion(value: number, lotteryDrawUid: string): void {
    this.lotteryVersion = value
    this.latestLotteryDrawUid = lotteryDrawUid
  }

  @action setUserLotteryVersion(value: number): void {
    this.userLotteryVersion = value
  }

  @action setLotteryWinner(value: LotteryWinner | null): void {
    this.lotteryWinner = value
  }

  @action setLatestLotteryDrawResultsSeen(value: boolean): void {
    this.latestLotteryDrawResultsSeen = value
  }

  @action clean() {
    this.lottery = null
    this.pending = true
    this.lotteryVersion = -1
    this.userLotteryVersion = -1
    this.lotteryWinner = null
  }
}
