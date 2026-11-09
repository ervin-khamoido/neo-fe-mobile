import { inject, injectable } from 'inversify'
import { computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { ILockStore, LockStoreSymbol } from '../../../services/store/lock.store'
import { ILockOrderDetails, Lock, LockAmountMode } from '../../../models'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'
import { ILotteryStore, LotteryStoreSymbol } from '../../../services/store/lottery.store'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode } from '../../../common/constrants'
import { formatExpirationDuration } from '../../../utils/helpers'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'

@screenAnalytics(AnalyticsFlow.Lock, AnalyticsScreen.Lock_MyLocks)
@breadcrumb('Lock')
@injectable()
export class LockBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(LockStoreSymbol) lockStore!: ILockStore
  @inject(LotteryStoreSymbol) lotteryStore!: ILotteryStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @observable loading = false

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

  @computed get locks(): Lock[] {
    return this.lockStore.locks
  }

  @computed get expiredLocks(): Lock[] {
    return this.lockStore.expiredLocks
  }

  @computed get activities() {
    const { lockActivities } = this.activityStore

    return lockActivities.filter(x => {
      const details = x.details as ILockOrderDetails

      return details.lock === this.locks[0]?.uid
    })
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  expiresIn(expiresAt: Date): string {
    return `Expires in ${formatExpirationDuration(expiresAt)}`
  }

  onCreateNewLock() {
    this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Create })
  }

  onAddFunds(uid: string) {
    return () => this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Deposit, uid })
  }

  onWithdraw(uid: string) {
    return () => this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Withdraw, uid })
  }

  onActivityPress(uid: string) {}
}
