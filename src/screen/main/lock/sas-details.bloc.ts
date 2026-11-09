import { breadcrumb } from '../../../utils/breadcrumb'
import { inject, injectable } from 'inversify'
import { IBLoC } from '../../../ioc'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { MainNavigatorDef } from '../../common'
import { ILotteryStore, LotteryStoreSymbol } from '../../../services/store/lottery.store'
import { computed, makeObservable } from 'mobx'
import { LockAmountMode } from '../../../models'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Lock, AnalyticsScreen.Lock_LotteryDetails)
@breadcrumb('SAS Details')
@injectable()
export class SasDetailsBloc implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(LotteryStoreSymbol) lotteryStore!: ILotteryStore

  @computed get lottery() {
    return this.lotteryStore.lottery
  }

  @computed get formattedAmount() {
    const amount = this.lottery?.nextDraw ? this.lottery?.nextDraw?.grandPrizeUsdc : this.lottery?.maxGrandPriceUsdc
    const formattedAmount = formatCurrency(amount, CurrencyCode.USD, false)

    return formattedAmount
  }

  @computed get endLotteryTS() {
    if (this.lottery?.nextDraw) {
      return new Date(this.lottery.nextDraw.drawAt)
    }

    return new Date()
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {}

  onParticipate() {
    this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Create })
  }
}
