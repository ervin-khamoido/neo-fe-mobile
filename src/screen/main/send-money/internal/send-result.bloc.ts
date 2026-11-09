import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { CurrentOrderStoreSymbol, ICurrentOrderStore } from '../../../../services/store/current-order.store'
import { IOrderService, OrderServiceSymbol } from '../../../../services/order.service'
import { TransferOrderInput } from '../../../../models/input/transfer-order.input'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'
import { formatUsername } from '../../../../utils/helpers'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'
import { SendMode } from '../../../../models'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Result, () => ({ mode: SendMode.OnChain }))
@breadcrumb('Send Result')
@injectable()
export class SendResultBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(CurrentOrderStoreSymbol) currentOrderStore!: ICurrentOrderStore

  @observable currentTransferOrder: TransferOrderInput | null = null
  @observable operationStatus = OperationStatus.Pending

  @computed get displayAmountUsdc() {
    const { amountUsdc } = this.currentTransferOrder

    return formatCurrency(amountUsdc, CurrencyCode.USD, false)
  }

  @computed get displayUsername() {
    const { receiver } = this.currentTransferOrder

    if (receiver.username) {
      return formatUsername(receiver.username)
    }

    return receiver.displayName
  }

  @computed get displaySuccessMsg() {
    const { amountUsdc, receiver } = this.currentTransferOrder
    const displayAmount = formatCurrency(amountUsdc, CurrencyCode.USD, false)
    const displayUsername = formatUsername(receiver.username)

    return `You've successfully sent ${displayAmount} to ${displayUsername}`
  }

  @computed get displayFailureMsg() {
    return 'There was a problem with your transfer'
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.currentTransferOrder = this.currentOrderStore.currentTransferOrder
    this.currentOrderStore.resetTransferOrder()

    try {
      yield this.orderService.addTransferOrder(this.currentTransferOrder)
      this.operationStatus = OperationStatus.Success
    } catch (err) {
      this.operationStatus = OperationStatus.Failure
    } finally {
      this.analyticsService.submit(AnalyticsFlow.Send, AnalyticsScreen.Send_Result, {
        amount: this.currentTransferOrder.amountUsdc,
        neobankFee: 0,
        providerFee: 0,
        total: this.currentTransferOrder.amountUsdc,
        status: this.operationStatus,
        mode: SendMode.Internal,
      })
    }
  }

  onParamsChange() {
    // nothing to do here
  }

  onClose() {
    this.navigationService.back()
  }
}

export enum OperationStatus {
  Pending = 'pending',
  Success = 'success',
  Failure = 'failure',
}
