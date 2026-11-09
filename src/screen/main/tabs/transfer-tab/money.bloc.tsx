import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { ScreenMode } from '../../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { IOrderService, OrderServiceSymbol } from '../../../../services/order.service'
import { FinanceServiceSymbol, IFinanceService } from '../../../../services/finance.service'
import { ILevelService, LevelServiceSymbol } from '../../../../services/level/level.service'
import { IOrdersStore, OrdersStoreSymbol } from '../../../../services/store/orders.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { IWalletStore, WalletStoreSymbol } from '../../../../services/store/wallet.store'

@breadcrumb('Money')
@injectable()
export class MoneyBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('Wallet') monitoring!: IMonitoringService

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(FinanceServiceSymbol) financeService!: IFinanceService
  @inject(LevelServiceSymbol) levelService!: ILevelService

  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore

  @observable addCashLoading = false
  @observable cashOutLoading = false
  @observable showCannotBuyModal = false
  @observable showCannotSellModal = false
  @observable showZeroBalanceModal = false

  @computed get balance() {
    const { balance = 0 } = this.walletStore?.balance ?? {}
    return balance
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onToggleCannotBuyModal() {
    this.showCannotBuyModal = !this.showCannotBuyModal
  }

  @action onToggleZeroBalanceModal() {
    this.showZeroBalanceModal = !this.showZeroBalanceModal
  }

  @action onToggleCannotSellModal() {
    this.showCannotSellModal = !this.showCannotSellModal
  }

  onReceive() {
    this.navigationService.navigate('Receive')
  }

  onSend() {
    this.navigationService.navigate('SendDestination')
  }

  onPay() {
    // TODO
    //this.navigationService.navigate('Pay')
  }

  onRequest() {
    // TODO
    //this.navigationService.navigate('Request')
  }

  onRewardsCenter() {
    this.navigationService.navigate('RewardsCenter')
  }

  @flow *onAddCash() {
    this.addCashLoading = true

    try {
      yield Promise.all([
        this.financeService.syncExchangeRates(),
        // this.financeService.syncFee(),
        this.levelService.syncCurrentLimits(),
        this.levelService.syncTransactionLimits(),
        this.orderService.syncCanCreatePO(),
      ])

      if (this.ordersStore.canCreatePO!.canCreate) {
        this.navigationService.navigate('Amount', { mode: ScreenMode.Buy })
      } else {
        this.addCashLoading = false
        this.onToggleCannotBuyModal()
      }
    } catch (err) {
      this.monitoring.exception(err)
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.addCashLoading = false
    }
  }

  @flow *onCashOut() {
    this.cashOutLoading = true
    try {
      yield Promise.all([
        this.financeService.syncExchangeRates(),
        // this.financeService.syncFee(),
        this.levelService.syncCurrentLimits(),
        this.levelService.syncTransactionLimits(),
        this.orderService.syncCanCreateSO(),
      ])

      if (this.ordersStore.canCreateSO!.canCreate) {
        if (this.balance === 0) {
          this.cashOutLoading = false
          this.onToggleZeroBalanceModal()
        } else {
          this.navigationService.navigate('Amount', { mode: ScreenMode.Sell })
        }
      } else {
        this.cashOutLoading = false
        this.onToggleCannotSellModal()
      }
    } catch (err) {
      this.monitoring.exception(err)
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.cashOutLoading = false
    }
  }
}
