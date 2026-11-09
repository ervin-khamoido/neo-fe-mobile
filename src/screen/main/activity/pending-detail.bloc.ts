import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { Activity, ActivityStatusEnum, ActivityType, SellOrderActivityStatus } from '../../../models'
import { IActivityTimelineStatus } from '../tabs/components/activity-timeline'
import { displayCurrency } from '../../../lib/utils/helpers'
import { IReactionDisposer } from 'mobx/dist/core/reaction'
import { getScreenForActivity } from '../common'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import { ConnectionError } from '@ts-awesome/request'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { RemoteConfig } from '../../../services/remote-config.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'

type PendingDetailsParams = {
  uid: string
}

@breadcrumb('Pending Details')
@injectable()
export class PendingDetailsBLoC implements IBLoC<unknown, PendingDetailsParams> {
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(ActivityServiceSymbol) activityService!: IActivityService
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(AppMonitoringServiceSymbol) @named('PendingDetail') monitoring!: IMonitoringService

  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @inject(NavigationParamsSymbol) @observable navParams!: PendingDetailsParams

  readonly srcCurrency: CurrencyCode = CurrencyCode.NGN // we sell Naira
  readonly destCurrency: CurrencyCode = CurrencyCode.USD // we get USDC
  private activityDisposer: IReactionDisposer | null = null

  get srcCurrencySymbol() {
    return CurrencyInfo[this.srcCurrency].symbol
  }

  @observable showReceivedModal = false
  @observable confirmCheckbox = false
  @observable loading = false

  get destCurrencySymbol() {
    return CurrencyInfo[this.destCurrency].symbol
  }

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get lastStatus() {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get transferSuccessful() {
    return this.lastStatus.status === SellOrderActivityStatus.TransferSuccessful
  }

  @computed get orderReference() {
    return this.activity?.orderReferenceNumber
  }

  @computed get statuses(): IActivityTimelineStatus[] {
    let pendingStatuses = []
    switch (this.activity?.type) {
      case ActivityType.Buy:
        pendingStatuses = this.activityStore.poStatusDefinitions
        break
      case ActivityType.Sell:
        pendingStatuses = this.activityStore.soStatusDefinitions
        break
      case ActivityType.Yield:
        pendingStatuses = this.activityStore.yoStatusDefinitions
        break
      case ActivityType.Reward:
        pendingStatuses = this.activityStore.rewardStatusDefinitions
        break
      default:
      // nothing
    }

    pendingStatuses = pendingStatuses.filter(x => !x.isClosed && x.isVisible)

    return pendingStatuses.map(s => {
      return {
        name: s.name,
        completed: !!this.activity.statuses.find(st => st.status === s.status),
      }
    })
  }

  @computed get showHolidayBanner() {
    const { remoteConfig } = this.appConfigStore

    return remoteConfig[RemoteConfig.ShowHolidayBanner]
  }

  constructor() {
    makeObservable(this)
    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityDisposer = reaction(
      () => this.activity,
      value => this.onActivityUpdate(value),
    )

    this.activityService.markAsRead(this.uid)
  }

  onActivityUpdate(value: Activity) {
    const typeToStatuesMap: Record<ActivityType, ActivityStatusEnum[]> = {
      [ActivityType.Buy]: this.activityStore.poStatusDefinitions.filter(x => x.isClosed).map(x => x.status),
      [ActivityType.Sell]: this.activityStore.soStatusDefinitions.filter(x => x.isClosed).map(x => x.status),
      [ActivityType.Yield]: [],
      [ActivityType.Reward]: [],
      [ActivityType.Transfer_Receive]: [],
      [ActivityType.Transfer_Send]: [],
      [ActivityType.Card]: [],
      [ActivityType.OnChain]: [],
    }

    const handleStatuses = typeToStatuesMap[value.type]

    if (!value || !handleStatuses.includes(value.status)) {
      return
    }

    // is handled manually
    if (value.type === ActivityType.Sell && value.status === SellOrderActivityStatus.Completed) {
      return
    }

    this.activityDisposer?.()
    this.activityDisposer = null

    const screen = getScreenForActivity(value)
    this.navigationService.replace(screen, { uid: value.uid })
  }

  onDisplayValue(item: number | string) {
    return displayCurrency(item).format()
  }

  async onSupport() {
    this.navigationService.navigate('EmailSupport')
  }

  @action onParamsChange(_, params: PendingDetailsParams) {
    this.navParams = params
  }
  @action onToggleReceivedModal() {
    this.confirmCheckbox = false
    this.showReceivedModal = !this.showReceivedModal
  }
  @action onToggleConfirmCheckbox() {
    this.confirmCheckbox = !this.confirmCheckbox
  }

  @flow *onConfirmReceivedModal() {
    this.loading = true
    try {
      yield this.orderService.confirmSellOrder(this.activity.order)
      this.showReceivedModal = false

      this.navigationService.replace('TransactionsDetails', { uid: this.activity.uid })
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toast.error('Service Temporary Unavailable')
      } else {
        this.toast.error(err instanceof Error ? err.message : 'Something went wrong')
      }
    } finally {
      this.loading = false
    }
  }

  @flow *onBackToWallet() {
    this.navigationService.navigate('MainTabs')
  }

  @action onDestroy() {
    if (this.activityDisposer) {
      this.activityDisposer()
      this.activityDisposer = null
    }
  }
}
