import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { formatExpirationDuration } from '../../../utils/helpers'
import { formatCurrency, formatDateInWAT } from '../../../lib/utils/helpers'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, DEFAULT_DATE_TIME_FORMAT } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ILockOrderDetails, LockAmountMode, LockStatus } from '../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'

import { ILockStore, LockStoreSymbol } from '../../../services/store/lock.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

type NavParams = MainNavigatorDef['LockDetails']

@screenAnalytics(AnalyticsFlow.Lock, AnalyticsScreen.Lock_Details)
@breadcrumb('Lock Details')
@injectable()
export class LockDetailsBloc implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  @inject(LockStoreSymbol) lockStore!: ILockStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @observable loading = false
  @observable addFundsLoading = false
  @observable withdrawEarlyLoading = false

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get data() {
    return this.lockStore.allLocks.find(x => x.uid === this.uid)
  }

  @computed get activities() {
    const { lockActivities } = this.activityStore

    return lockActivities.filter(x => {
      const details = x.details as ILockOrderDetails

      return details.lock === this.uid
    })
  }

  @computed get isExpired() {
    return this.data.status === LockStatus.EXPIRED
  }

  @computed get expiresIn() {
    return `Expires in ${formatExpirationDuration(this.data.expiresAt)}`
  }

  @computed get expiredAt() {
    const at = this.data?.expiredAt ? formatDateInWAT(this.data.expiredAt, DEFAULT_DATE_TIME_FORMAT) : ''
    return `Expired at ${at}`
  }

  @computed get formattedAmount() {
    return formatCurrency(this.data.balance, CurrencyCode.USD, false)
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  onAddFunds() {
    this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Deposit, uid: this.uid })
  }

  onWithdrawEarly() {
    this.navigationService.navigate('LockAmount', { mode: LockAmountMode.Withdraw, uid: this.uid })

    // const {
    //   lock: { withdrawalPercentageFee, uid },
    // } = this.navParams
    //
    // this.navigationService.navigate('LockAmount', {
    //   mode: LockAmountMode.Withdraw,
    //   amountUsdc: withdrawalPercentageFee,
    //   uid,
    //   // TODO
    //   durationInDays: 30,
    // })
  }

  onActivityPress(uid: string) {}
}
