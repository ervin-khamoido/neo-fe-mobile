import { inject, injectable } from 'inversify'
import { computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'
import { cutMiddleOfString } from '../../../../utils/helpers'
import { IOnChainStore, OnChainStoreSymbol } from '../../../../services/store/on-chain.store'
import { CalculatedOnChainOrderOutput, SendMode } from '../../../../models'
import { IOnChainService, OnChainServiceSymbol } from '../../../../services/on-chain.service'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../../services/analytics/analytics.service'

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Result, () => ({ mode: SendMode.OnChain }))
@breadcrumb('Send OnChain Result')
@injectable()
export class SendOnChainResultBloc implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(OnChainServiceSymbol) onChainService!: IOnChainService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(OnChainStoreSymbol) onChainStore!: IOnChainStore

  @observable currentOnChainOrder: CalculatedOnChainOrderOutput | null = null
  @observable operationStatus = OperationStatus.Pending

  @computed get displayAmountUsdc() {
    const { amountUsdc } = this.currentOnChainOrder

    return formatCurrency(amountUsdc, CurrencyCode.USD, false)
  }

  @computed get displayAddress() {
    const { toAddress } = this.currentOnChainOrder

    return cutMiddleOfString(toAddress)
  }

  @computed get displayFailureMsg() {
    return 'There was a problem with your on-chain transaction.'
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {
    this.currentOnChainOrder = this.onChainStore.currentOnChainOrder
    this.onChainStore.resetCurrentOnChainOrder()

    try {
      yield this.onChainService.createOnChainOrder({ txRef: this.currentOnChainOrder.txRef })
      this.operationStatus = OperationStatus.Success
    } catch (err) {
      this.operationStatus = OperationStatus.Failure
    } finally {
      this.analyticsService.submit(AnalyticsFlow.Send, AnalyticsScreen.Send_Result, {
        amount: this.currentOnChainOrder.amountUsdc,
        total: this.currentOnChainOrder.totalUsdc,
        neobankFee: this.currentOnChainOrder.fees.neobankFeeUsdc,
        providerFee: this.currentOnChainOrder.fees.networkFeeUsdc,
        status: this.operationStatus,
        mode: SendMode.OnChain,
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
