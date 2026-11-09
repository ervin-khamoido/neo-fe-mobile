import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import Clipboard from '@react-native-clipboard/clipboard'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { CurrencyCode } from '../../../common/constrants'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { ActivityStatus, EventTypes, TapEventProps } from '../../../models'
import { formatCurrency } from '../../../lib/utils/helpers'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { ActivityServiceSymbol, IActivityService } from '../../../services/activity/activity.service'
import { formatActivityDate } from '../../../utils/helpers'

type MoneyTransferDetailsParams = MainNavigatorDef['MoneyTransferDetails']

@breadcrumb('Money Transfer Details')
@injectable()
export class MoneyTransferDetailsBLoC implements IBLoC<unknown, MoneyTransferDetailsParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityServiceSymbol) activityService!: IActivityService

  @inject(NavigationParamsSymbol) @observable navParams!: MoneyTransferDetailsParams

  @computed get uid() {
    return this.navParams.uid
  }

  @computed get activity() {
    return this.activityStore.getOne(this.uid)
  }

  @computed get lastStatus(): ActivityStatus {
    return this.activity.statuses[this.activity.statuses.length - 1]
  }

  @computed get displayStatusDate() {
    return this.lastStatus ? formatActivityDate(this.lastStatus.statusDatetime) : ''
  }

  @computed get displayNGNAmount() {
    return formatCurrency(this.activity?.amount ?? 0, CurrencyCode.NGN, false)
  }

  @computed get displayUSDAmount() {
    return formatCurrency(this.activity?.amountUsdc ?? 0, CurrencyCode.USD, false)
  }

  @computed get backToWalletShows() {
    return this.navParams.headerShown ?? true
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.activityService.markAsRead(this.uid)
  }

  @flow *onSupport() {
    this.navigationService.navigate('ContactSupport')
  }

  onBackToWallet() {
    this.navigationService.back()
  }

  @action onParamsChange(_, params: MoneyTransferDetailsParams) {
    this.navParams = params
  }

  @action onCopyOrderNumber() {
    Clipboard.setString(this.activity?.orderReferenceNumber)
  }
}
