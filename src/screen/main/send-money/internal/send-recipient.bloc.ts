import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import _ from 'lodash'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../../services/user.service'
import { IReactionDisposer } from 'mobx/dist/core/reaction'
import { UserSearchOutput } from '../../../../models/output/user-search.output'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../../services/store/current-order.store'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'
import { SendMode } from '../../../../models'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Recipient, () => ({ mode: SendMode.Internal }))
@breadcrumb('Send Recipient')
@injectable()
export class SendRecipientBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(UserServiceSymbol) userService!: IUserService

  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @observable loading = false
  @observable search = ''
  @observable users: UserSearchOutput[] = []

  @computed get canStartSearch() {
    return this.search.trim().length >= SEARCH_MIN_LENGTH
  }

  @computed get displayAmountUsdc() {
    const { currentTransferOrder } = this.currentOrderStore

    return formatCurrency(currentTransferOrder?.amountUsdc ?? 0, CurrencyCode.USD, false)
  }

  private _disposer: IReactionDisposer

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this._disposer = reaction(
      () => this.search,
      _.debounce(x => this.triggerSearch(x), SEARCH_DEBOUNCE_INTERVAL),
    )
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onSearchChange(value: string): void {
    this.search = value
  }

  @flow *triggerSearch(value: string) {
    if (!this.canStartSearch) {
      this.users = []
      return
    }

    this.loading = true
    this.users = yield this.userService.search(value)
    this.loading = false
  }

  @action onItemPress(uid: string) {
    const user = this.users.find(x => x.uid === uid)!
    this.currentOrderStore.updateTransferOrder('receiver', user)

    this.navigationService.replace('SendConfirm')
  }
}

const SEARCH_DEBOUNCE_INTERVAL = 333
const SEARCH_MIN_LENGTH = 1 // change to 3 when integrating the API
