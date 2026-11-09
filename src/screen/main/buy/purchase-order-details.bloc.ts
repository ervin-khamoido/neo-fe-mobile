import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import { IReactionDisposer } from 'mobx/dist/core/reaction'

import { IBLoC } from '../../../ioc'
import { getScreenForActivity } from '../common'
import { MainNavigatorDef } from '../../common'
import { displayCurrency, formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { Activity, ActivityStatusEnum, ScreenMode } from '../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'

import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'

import { IActivityTimelineStatus } from '../tabs/components/activity-timeline'
import { breadcrumb } from '../../../utils/breadcrumb'
import { RemoteConfig } from '../../../services/remote-config.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

type PurchaseOrderDetailsParams = { uid: string }

@screenAnalytics(AnalyticsFlow.Cash, AnalyticsScreen.Cash_OrderDetails, () => ({ mode: ScreenMode.Buy }))
@breadcrumb('Purchase Order Details')
@injectable()
export class PurchaseOrderDetailsBLoC implements IBLoC<undefined, PurchaseOrderDetailsParams> {
  get srcCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.NGN].symbol
  }
  get destCurrencySymbol() {
    return CurrencyInfo[CurrencyCode.USD].symbol
  }

  @inject(NavigationParamsSymbol) @observable navParams!: PurchaseOrderDetailsParams

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(SupportServiceSymbol) supportService!: ISupportService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @computed get data() {
    return this.activityStore.getByOrder(this.navParams.uid)
  }

  @computed get statuses(): IActivityTimelineStatus[] {
    const pendingStatuses = this.activityStore.poStatusDefinitions.filter(x => !x.isClosed && x.isVisible)

    return pendingStatuses.map(s => {
      return {
        name: s.name,
        completed: !!this.data?.statuses.find(st => st.status === s.status),
      }
    })
  }

  @computed get orderReference() {
    return this.data?.orderReferenceNumber
  }

  @computed get amount() {
    return this.data?.amount
  }

  @computed get formattedAmount() {
    return formatCurrency(this.data?.amount, CurrencyCode.NGN, false)
  }

  @computed get amountUsdc() {
    return this.data?.amountUsdc
  }

  @computed get formattedAmountUsdc() {
    return formatCurrency(this.data?.amountUsdc, CurrencyCode.USD, false)
  }

  @computed get showHolidayBanner() {
    const { remoteConfig } = this.appConfigStore

    return remoteConfig[RemoteConfig.ShowHolidayBanner]
  }

  private activityDisposer: IReactionDisposer | null = null

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityDisposer = reaction(
      () => this.data,
      value => this.onActivityUpdate(value),
    )
  }

  onActivityUpdate(value: Activity) {
    // best point to track transaction,
    // it is at this point we can tell the real state of the transaction
    const handleStates: ActivityStatusEnum[] = this.activityStore.poStatusDefinitions
      .filter(x => x.isClosed)
      .map(x => x.status)

    if (!value || !handleStates.includes(value.status)) {
      return
    }

    this.activityDisposer?.()
    this.activityDisposer = null

    const screen = getScreenForActivity(value)
    this.navigationService.replace(screen, { uid: value.uid, headerShown: false })
  }

  onDisplayValue(item: number | string) {
    return displayCurrency(item).format()
  }

  async onSupport() {
    this.navigationService.navigate('EmailSupport')
  }

  @action onParamsChange(_, params: PurchaseOrderDetailsParams) {
    this.navParams = params
  }

  @flow *onBackToWallet() {
    this.navigationService.reset(['MainTabs'], [undefined])
  }

  @action onDestroy() {
    if (this.activityDisposer) {
      this.activityDisposer()
      this.activityDisposer = null
    }
  }
}
