import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { formatCurrency } from '../../../lib/utils/helpers'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ILotteryStore, LotteryStoreSymbol } from '../../../services/store/lottery.store'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'
import { ILotteryService, LotteryServiceSymbol } from '../../../services/lottery.service'

@screenAnalytics(AnalyticsFlow.Lottery, AnalyticsScreen.Lottery_Winner)
@breadcrumb('Lottery Winner')
@injectable()
export class LotteryWinnerBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(LotteryStoreSymbol) lotteryStore!: ILotteryStore
  @inject(LotteryServiceSymbol) lotteryService!: ILotteryService

  @observable state = LotteryWinnerState.CountDown

  @computed get lotteryWinner() {
    return this.lotteryStore.lotteryWinner
  }

  @computed get displayAmount() {
    if (!this.lotteryWinner) {
      return ''
    }

    return formatCurrency(this.lotteryWinner.amountUsdc, CurrencyCode.USD, false)
  }

  @computed get displayDrawAt() {
    if (!this.lotteryWinner) {
      return ''
    }

    return format(this.lotteryWinner.lotteryDraw.drawAt, 'MMM dd, yyyy')
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {}

  @flow *onAnimationFinish() {
    yield this.lotteryService.markLatestLotteryDrawResultsAsSeen()

    if (this.lotteryWinner.amountUsdc) {
      this.state = LotteryWinnerState.Winner
    } else {
      this.state = LotteryWinnerState.Loser
    }
  }

  onBack() {
    this.navigationService.back()
  }
}

export enum LotteryWinnerState {
  CountDown,
  Winner,
  Loser,
}
