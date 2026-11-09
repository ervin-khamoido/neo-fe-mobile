import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { ILockStore, LockStoreSymbol } from '../../../services/store/lock.store'
import { ILotteryService, LotteryServiceSymbol } from '../../../services/lottery.service'
import { LockAmountMode } from '../../../models'

type NavParams = MainNavigatorDef['LockCreateResult']

@injectable()
export class LockCreateResultBloc implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(LotteryServiceSymbol) lotteryService!: ILotteryService

  @inject(LockStoreSymbol) lockStore!: ILockStore

  @inject(NavigationParamsSymbol) navParams!: NavParams

  @observable isAnimationFinished = false
  @observable loading = false

  constructor() {
    makeObservable(this)
  }

  @computed get amount() {
    return formatCurrency(this.navParams.initialDepositUsdc, CurrencyCode.USD, false)
  }

  @computed get withdrawalAmount() {
    const { withdrawalPercentageFee } = this.lock
    const amount = this.navParams.initialDepositUsdc

    const penalty = currency(amount).multiply(withdrawalPercentageFee)
    const amountIncludePenalty = currency(amount).subtract(penalty).value

    return formatCurrency(amountIncludePenalty, CurrencyCode.USD, false)
  }

  @computed get formattedLockUntilDate() {
    return this.navParams.untilDate
  }

  @computed get mode() {
    return this.navParams.mode
  }

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get lock() {
    return this.lockStore.allLocks.find(x => x.uid === this.uid)
  }

  @action onAnimationFinished() {
    this.isAnimationFinished = true
  }

  @flow *onClose() {
    this.loading = true
    yield this.lotteryService.syncLottery()
    this.loading = false

    if (this.mode === LockAmountMode.Withdraw && !this.lock.balance) {
      this.navigationService.navigate('MainTabs')
      return
    }

    this.navigationService.reset(['MainTabs', 'Lock'], [undefined])
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }
}
