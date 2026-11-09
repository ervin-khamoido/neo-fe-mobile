import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { format } from 'date-fns'
import { ConnectionError } from '@ts-awesome/request'
import currency from 'currency.js'

import { IBLoC } from '../../../ioc'
import { CurrencyCode, CurrencyInfo } from '../../../common/constrants'
import { MainNavigatorDef } from '../../common'
import { displayCurrency, formatCurrency, getFontSizeForWallet } from '../../../lib/utils/helpers'
import { OnboardingType, ScreenMode } from '../../../models'
import { breadcrumb } from '../../../utils/breadcrumb'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { FinanceServiceSymbol, IFinanceService } from '../../../services/finance.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IWalletService, WalletServiceSymbol } from '../../../services/wallet.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'
import { IReferralService, ReferralServiceSymbol } from '../../../services/referral.service'

import { IPreferenceStore, PreferenceStoreSymbol } from '../../../services/store/preference.store'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { IWalletStore, WalletStoreSymbol } from '../../../services/store/wallet.store'
import { IOrderService, OrderServiceSymbol } from '../../../services/order.service'
import { IOrdersStore, OrdersStoreSymbol } from '../../../services/store/orders.store'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../services/level/level-one.service'
import { ILevelService, LevelServiceSymbol } from '../../../services/level/level.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { RemoteConfig } from '../../../services/remote-config.service'
import { getScreenForActivity } from '../common'
import { IReferralStore, ReferralStoreSymbol } from '../../../services/store/referral.store'
import { IRewardStore, RewardStoreSymbol } from '../../../services/store/reward.store'
import { ILockService, LockServiceSymbol } from '../../../services/lock.service'
import { ILotteryStore, LotteryStoreSymbol } from '../../../services/store/lottery.store'
import { ILockStore, LockStoreSymbol } from '../../../services/store/lock.store'
import { ILotteryService, LotteryServiceSymbol } from '../../../services/lottery.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@breadcrumb('Wallet')
@injectable()
export class WalletBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('Wallet') monitoring!: IMonitoringService

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ReferralServiceSymbol) referralService!: IReferralService

  @inject(FinanceServiceSymbol) financeService!: IFinanceService
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(WalletServiceSymbol) walletService!: IWalletService
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(LevelServiceSymbol) levelService!: ILevelService
  @inject(OrderServiceSymbol) orderService!: IOrderService
  @inject(LockServiceSymbol) lockService!: ILockService
  @inject(LotteryServiceSymbol) lotteryService!: ILotteryService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService
  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService

  @inject(PreferenceStoreSymbol) preferenceStore!: IPreferenceStore
  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore
  @inject(AppConfigStoreSymbol) appConfig!: IAppConfigStore
  @inject(ReferralStoreSymbol) referralStore!: IReferralStore
  @inject(RewardStoreSymbol) rewardStore!: IRewardStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(LotteryStoreSymbol) lotteryStore!: ILotteryStore
  @inject(LockStoreSymbol) lockStore!: ILockStore

  @observable helpCenterLoading = false

  @observable loading = true
  @observable addCashLoading = false
  @observable cashOutLoading = false
  @observable sendLoading = false
  @observable bankAccountsLoading = false
  @observable inviteFriendLoading = false
  @observable lockLoading = false

  @observable showCannotBuyModal = false
  @observable showCannotSellModal = false
  @observable showZeroBalanceModal = false

  @observable currency = CurrencyCode.USD
  @observable currencyToggle = false
  @observable equivalentCurrency = CurrencyCode.NGN

  @computed get currencySymbol() {
    return CurrencyInfo[this.currency].symbol
  }

  @computed get equivalentCurrencySymbol() {
    return CurrencyInfo[this.equivalentCurrency].symbol
  }

  @computed get shortReferralRewardInfo() {
    const defaultValue = ''
    const referrerInfo = this.referralStore.referrerInfo
    if (!referrerInfo) {
      return defaultValue
    }

    return referrerInfo.rewardDetails?.shortReferralRewardInfo ?? defaultValue
  }

  @computed get showNeobankAppSaturdayBanner() {
    return this.appConfig.remoteConfig[RemoteConfig.NeobankAppSaturday]
  }

  @computed get showRewardCenter() {
    return this.appConfig.remoteConfig[RemoteConfig.RewardCenter]
  }

  @computed get showLockBtn() {
    return this.appConfig.remoteConfig[RemoteConfig.DepositLocks]
  }

  @computed get rewardBannerText() {
    const rewardTotalEarnedAmount = this.rewardStore.totalEarnedAmount

    return `You have earned a total of ${rewardTotalEarnedAmount} in rewards on Neobank App`
  }

  @computed get activity() {
    return this.activityStore.walletActivities.slice(0, 10)
  }

  @computed get balance() {
    const { balance = 0 } = this.walletStore?.balance ?? {}
    return balance
  }

  @computed get formattedBalance() {
    const { sellExchangeRate = 0 } = this.financeStore
    let balance = this.balance
    if (this.currency === CurrencyCode.NGN) {
      balance = currency(balance, { precision: 2 }).multiply(sellExchangeRate).value
    }

    return formatCurrency(balance, this.currency, false)
  }

  // @computed get displayBalance() {
  //   const { sellExchangeRate = 0 } = this.financeStore

  //   if (this.currency === CurrencyCode.USD) {
  //     return displayCurrency(this.balance).format()
  //   } else {
  //     return displayCurrency(this.balance).multiply(sellExchangeRate).format()
  //   }
  // }

  // @computed get equivalentBalance() {
  //   const { sellExchangeRate = 0 } = this.financeStore

  //   if (this.currency === CurrencyCode.USD) {
  //     return displayCurrency(this.balance).multiply(sellExchangeRate).format()
  //   } else {
  //     return displayCurrency(this.balance).format()
  //   }
  // }

  @computed get numberFontSize() {
    return getFontSizeForWallet(this.formattedBalance)
  }

  @computed get displayYieldBalance() {
    const { sellExchangeRate = 0 } = this.financeStore
    const { balance = 0, dueDate = new Date() } = this.walletStore?.yieldBalance ?? {}

    const displayBalance =
      this.currency === CurrencyCode.USD
        ? displayCurrency(balance)
        : displayCurrency(balance).multiply(sellExchangeRate)

    return {
      balance: `${displayBalance.format()}`,
      dueDate: format(dueDate, 'd MMM yyyy'),
    }
  }

  @computed get hasActivePayment() {
    return this.activityStore.pendingPaymentPOs.length > 0
  }

  @computed get showSendBtn() {
    return this.appConfig.remoteConfig[RemoteConfig.SendOffChain]
  }

  @computed get poActivity() {
    const activities = this.activityStore.pendingPaymentPOs

    return activities.length ? activities[0] : null
  }

  @computed get lottery() {
    return this.lotteryStore.lottery
  }

  @computed get lotteryPending() {
    return this.lotteryStore.pending
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action onToggleCannotBuyModal() {
    this.showCannotBuyModal = !this.showCannotBuyModal
  }

  @action onToggleCannotSellModal() {
    this.showCannotSellModal = !this.showCannotSellModal
  }

  @action onToggleZeroBalanceModal() {
    this.showZeroBalanceModal = !this.showZeroBalanceModal
  }

  @flow *initialize() {
    this.currency = this.preferenceStore.currentCurrency

    yield this.financeService.syncExchangeRates()

    this.loading = false
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onToggleCurrency() {
    if (this.currency === CurrencyCode.USD) {
      this.currency = CurrencyCode.NGN
      this.equivalentCurrency = CurrencyCode.USD
      this.currencyToggle = !this.currencyToggle
    } else {
      this.currency = CurrencyCode.USD
      this.equivalentCurrency = CurrencyCode.NGN
      this.currencyToggle = !this.currencyToggle
    }

    this.preferenceStore.setCurrentCurrency(this.currency)
  }

  @flow *onSupport() {
    this.helpCenterLoading = true
    yield this.supportService.navigateToHelpCenter()
    this.helpCenterLoading = false
  }

  @flow *onInvite() {
    this.inviteFriendLoading = true

    try {
      yield this.referralService.syncReferralInfo()

      this.navigationService.navigate('InviteLink')
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else {
        this.toastService.error(typeof err === 'string' ? err : err.message)
      }
    } finally {
      this.inviteFriendLoading = false
    }
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

  @flow *onSavedBankAccounts() {
    this.bankAccountsLoading = true

    try {
      yield Promise.all([this.userService.syncBanks(), this.userService.syncBankAccounts(), this.userService.syncMe()])

      this.navigationService.navigate('SavedBankAccounts')
    } catch (err) {
      this.monitoring.exception(err)
      this.toastService.error(err?.message ?? 'Something went wrong')
    } finally {
      this.bankAccountsLoading = false
    }
  }

  @flow *onActivity() {
    this.navigationService.navigate('Activity')
  }

  @flow *onDetailPress(uid: string) {
    const activity = this.activityStore.getOne(uid)

    if (!activity) {
      return
    }
    const screen = getScreenForActivity(activity)

    if (screen === 'BankTransfer') {
      const orderUid = this.poActivity.order

      const order = this.ordersStore.getPurchaseOrder(orderUid)
      if (!order) {
        this.loading = true

        try {
          yield this.orderService.syncPurchaseOrder(orderUid)
        } catch (err) {
          if (err instanceof ConnectionError) {
            this.toastService.error('Service Temporary Unavailable')
          } else {
            this.toastService.error(err.message)
          }
        } finally {
          this.loading = false
        }
      }

      this.navigationService.navigate('BankTransfer', { uid: orderUid })
    } else {
      this.navigationService.navigate(screen, { uid })
    }
  }

  @flow *onLockPage() {
    this.lockLoading = true
    try {
      yield this.lockService.syncLocks()
      this.navigationService.navigate('Lock')
    } catch (err) {
      this.toastService.error('Oops... Something went wrong, please try again.')
    } finally {
      this.lockLoading = false
    }
  }

  @flow *onSasDetailsPage() {
    this.lockLoading = true
    try {
      yield this.lotteryService.syncLottery()
      this.navigationService.navigate('SasDetails')
    } catch (err) {
      this.toastService.error('Oops... Something went wrong, please try again.')
    } finally {
      this.lockLoading = false
    }
  }

  onActivityPage() {
    this.navigationService.navigate('Activity')
  }

  onReferPress() {
    this.navigationService.navigate('RewardsCenter')
  }

  onFeatureOnboardingPage() {
    this.navigationService.navigate('FeatureOnboarding', {
      type: OnboardingType.PLS,
    })
  }

  onNeobankAppSaturdayPress() {
    const isPlsOnboardingSeen = this.appConfigStore?.isOnboardingSeen?.[OnboardingType.PLS]

    this.analyticsService.tap(AnalyticsFlow.Main, AnalyticsScreen.MainTabs_Wallet, {
      tag: 'pls_banner',
    })

    if (isPlsOnboardingSeen) {
      if (this.lockStore.locks.length) {
        this.onLockPage()
      } else {
        this.onSasDetailsPage()
      }
    } else {
      this.onFeatureOnboardingPage()
    }
  }

  @computed get showLotteryWinner() {
    const { lotteryWinner, latestLotteryDrawResultsSeen } = this.lotteryStore
    return lotteryWinner && !latestLotteryDrawResultsSeen
  }

  onWinnerReveal() {
    this.navigationService.navigate('LotteryWinner')
  }
}
