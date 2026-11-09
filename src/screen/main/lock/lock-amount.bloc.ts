import { inject, injectable } from 'inversify'
import { addDays, addMonths, differenceInCalendarDays, differenceInDays, format } from 'date-fns'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { AmountFSMSymbol, IAmountFSM } from '../../../utils/amount.fsm'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode, DATE_PATTERN, StatusCode } from '../../../common/constrants'
import { MainNavigatorDef } from '../../common'
import { LockAmountMode, LockInput, LockWithdrawalMode } from '../../../models'

import { IWalletStore, WalletStoreSymbol } from '../../../services/store/wallet.store'
import { FinanceStoreSymbol, IFinanceStore } from '../../../services/store/finance.store'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'

import { ILockService, LockServiceSymbol } from '../../../services/lock.service'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ILockStore, LockStoreSymbol } from '../../../services/store/lock.store'
import { screenAnalytics } from '../../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'
import currency from 'currency.js'

export interface ILockDurationOption {
  label: string
  value: number
  tag: SelectedDateTag
}

export enum SelectedDateTag {
  FIRST_OPTION = 'first_option',
  SECOND_OPTION = 'second_option',
  THIRD_OPTION = 'third_option',
  CUSTOM_DATE = 'custom_date',
}

type NavParams = MainNavigatorDef['LockAmount']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Lock, AnalyticsScreen.Lock_Amount, (_, params) => ({
  mode: params.mode,
}))
@breadcrumb('Lock Amount')
@injectable()
export class LockAmountBLoC implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(LockServiceSymbol) lockService!: ILockService
  @inject(AppMonitoringServiceSymbol) monitoringService!: IMonitoringService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(WalletStoreSymbol) walletStore!: IWalletStore
  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(LockStoreSymbol) lockStore!: ILockStore

  @inject(AmountFSMSymbol) fsm!: IAmountFSM
  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  @observable loading = false
  @observable withdrawAllLoading = false

  @observable isFirstCheckBoxToggled = false

  @observable isDatePickerVisible = false
  @observable isWithdrawalConfirmationModalVisible = false

  @observable lockWithdrawalMode: LockWithdrawalMode | null = null
  @observable isWithdrawalFeesAccepted: boolean = false

  @observable selectedDateTag: SelectedDateTag | null = null

  @observable data: LockInput = {
    name: 'Dream Lock',
    durationInDays: 0,
    initialDepositUsdc: INCREMENT_STEP,
  }

  @computed get mode(): LockAmountMode {
    return this.navParams.mode
  }

  @computed get uid() {
    switch (this.navParams.mode) {
      case LockAmountMode.Deposit:
      case LockAmountMode.Withdraw:
        return this.navParams.uid
      default:
        return null
    }
  }

  @computed get lock() {
    return this.lockStore.allLocks.find(x => x.uid === this.uid)
  }

  @computed get lockBalance() {
    return this.lock?.balance ?? 0
  }

  @computed get formattedLockBalance() {
    return formatCurrency(this.lockBalance, CurrencyCode.USD, false)
  }

  @computed get dreamPoints() {
    return currency(this.data.initialDepositUsdc).divide(10).value
  }

  @computed get formattedAmount() {
    return formatCurrency(this.data.initialDepositUsdc, CurrencyCode.USD, false)
  }

  @computed get balance() {
    const { balance = 0 } = this.walletStore?.balance ?? {}
    return balance
  }

  @computed get isDecreaseBtnDisabled() {
    return this.data.initialDepositUsdc <= INCREMENT_STEP || this.loading || this.withdrawAllLoading
  }

  @computed get isIncreaseBtnDisabled() {
    return this.loading || this.withdrawAllLoading
  }

  @computed get lockDurationOptions(): ILockDurationOption[] {
    const currentDate = new Date()

    const oneMonthDate = addMonths(currentDate, 1)
    const oneMonthInDays = differenceInDays(oneMonthDate, currentDate)

    const treeMonthsDate = addMonths(currentDate, 3)
    const treeMonthsInDays = differenceInDays(treeMonthsDate, currentDate)

    return [
      {
        label: '1 week',
        value: 7,
        tag: SelectedDateTag.FIRST_OPTION,
      },
      {
        label: '1 Month',
        value: oneMonthInDays,
        tag: SelectedDateTag.SECOND_OPTION,
      },
      {
        label: '3 Months',
        value: treeMonthsInDays,
        tag: SelectedDateTag.THIRD_OPTION,
      },
    ]
  }

  @computed get formattedBalance() {
    return formatCurrency(this.balance, CurrencyCode.USD, false)
  }

  @computed get isCreateBtnDisabled() {
    const { initialDepositUsdc, name, durationInDays } = this.data

    switch (this.mode) {
      case LockAmountMode.Create: {
        const isAmountInRange = initialDepositUsdc >= INCREMENT_STEP && initialDepositUsdc <= this.balance
        return this.loading || !isAmountInRange || !name || !durationInDays || !this.isFirstCheckBoxToggled
      }
      case LockAmountMode.Deposit: {
        const isAmountInRange = initialDepositUsdc >= INCREMENT_STEP && initialDepositUsdc <= this.balance
        return this.loading || this.withdrawAllLoading || !isAmountInRange || !this.isFirstCheckBoxToggled
      }
      case LockAmountMode.Withdraw: {
        const isAmountInRange = initialDepositUsdc >= INCREMENT_STEP && initialDepositUsdc <= this.lockBalance
        return this.loading || this.withdrawAllLoading || !isAmountInRange || !this.isFirstCheckBoxToggled
      }
    }
  }

  @computed get formattedLockSelectedUntilDate() {
    switch (this.mode) {
      case LockAmountMode.Withdraw:
      case LockAmountMode.Deposit:
        return format(this.lock.expiresAt, DATE_PATTERN)
      case LockAmountMode.Create:
        if (this.data.durationInDays) {
          return format(addDays(new Date(), this.data.durationInDays), DATE_PATTERN)
        }
    }
  }

  @computed get formattedWithdrawalAmountIncludeFees() {
    if (this.mode === LockAmountMode.Withdraw) {
      const { withdrawalPercentageFee } = this.lock
      const balance = this.data.initialDepositUsdc

      let withdrawalAmountIncludeFeesValue = 0

      switch (this.lockWithdrawalMode) {
        case LockWithdrawalMode.WITHDRAW:
          withdrawalAmountIncludeFeesValue = currency(balance).multiply(withdrawalPercentageFee).value
          break
        case LockWithdrawalMode.WITHDRAW_ALL:
          withdrawalAmountIncludeFeesValue = currency(this.lock.balance).multiply(withdrawalPercentageFee).value
          break
      }

      return formatCurrency(withdrawalAmountIncludeFeesValue, CurrencyCode.USD, false)
    }
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @action onIncreaseAmount() {
    switch (this.mode) {
      case LockAmountMode.Withdraw:
        if (this.data.initialDepositUsdc + INCREMENT_STEP > this.lock?.balance) {
          return
        }
        break
      default:
        if (this.data.initialDepositUsdc + INCREMENT_STEP > this.balance) {
          return
        }
        break
    }

    this.data.initialDepositUsdc += INCREMENT_STEP
  }

  @action onDecreaseAmount() {
    if (this.data.initialDepositUsdc <= INCREMENT_STEP) {
      return
    }

    this.data.initialDepositUsdc -= INCREMENT_STEP
  }

  @action onToggleFirstCheckBox() {
    this.isFirstCheckBoxToggled = !this.isFirstCheckBoxToggled

    if (this.isFirstCheckBoxToggled) {
      this.analyticsService.selectOption(AnalyticsFlow.Lock, AnalyticsScreen.Lock_Amount, {
        option: 'confirm_checkbox',
      })
    }
  }

  @action onSelectDurationOption(value: number, tag: SelectedDateTag) {
    this.data.durationInDays = value
    this.selectedDateTag = tag
  }

  @action onSelectCustomDate(value: Date) {
    const currentDate = new Date()
    const daysDifference = Math.min(
      MAX_LOCK_DAYS,
      Math.max(MIN_LOCK_DAYS, differenceInCalendarDays(value, currentDate)),
    )

    this.onHideDatePicker()
    this.onSelectDurationOption(daysDifference, SelectedDateTag.CUSTOM_DATE)
  }

  @action onSelectCustomDateOption() {
    this.onShowDatePicker()
  }

  @action onHideDatePicker() {
    this.isDatePickerVisible = false
  }

  @action onShowDatePicker() {
    this.isDatePickerVisible = true
  }

  @action onHideWithdrawalConfirmationModal() {
    this.isWithdrawalConfirmationModalVisible = false
  }

  @action onShowWithdrawalConfirmationModal(withdrawalMode: LockWithdrawalMode) {
    if (withdrawalMode === LockWithdrawalMode.WITHDRAW_ALL) {
      this.data.initialDepositUsdc = this.lock.balance
    }

    this.lockWithdrawalMode = withdrawalMode
    this.isWithdrawalConfirmationModalVisible = true
  }

  @flow *onSubmit() {
    this.loading = true

    try {
      const { initialDepositUsdc } = this.data
      let lockUid = this.lock?.uid

      switch (this.mode) {
        case LockAmountMode.Create:
          lockUid = yield this.lockService.createLock(this.data)
          break
        case LockAmountMode.Deposit:
          yield this.lockService.depositLock({ uid: this.uid, amountUsdc: this.data.initialDepositUsdc })
          break
        case LockAmountMode.Withdraw:
          if (this.isWithdrawalFeesAccepted) {
            yield this.lockService.withdrawLock({ uid: this.uid, amountUsdc: this.data.initialDepositUsdc })
          } else {
            this.onShowWithdrawalConfirmationModal(LockWithdrawalMode.WITHDRAW)
            return
          }
          break
      }

      this.analyticsService.submit(AnalyticsFlow.Lock, AnalyticsScreen.Lock_Amount, {
        mode: this.mode,
        amount: this.data.initialDepositUsdc,
        status: 'success',
      })

      this.navigationService.replace('LockCreateResult', {
        mode: this.mode,
        uid: lockUid,
        initialDepositUsdc,
        untilDate: this.formattedLockSelectedUntilDate,
      })
    } catch (err) {
      this.analyticsService.submit(AnalyticsFlow.Lock, AnalyticsScreen.Lock_Amount, {
        mode: this.mode,
        amount: this.data.initialDepositUsdc,
        status: 'failure',
      })

      this.handleError(err)
    } finally {
      this.loading = false
    }
  }

  @flow *onWithdrawHandler() {
    this.isWithdrawalConfirmationModalVisible = false
    this.isWithdrawalFeesAccepted = true

    switch (this.lockWithdrawalMode) {
      case LockWithdrawalMode.WITHDRAW:
        yield this.onSubmit()
        break
      case LockWithdrawalMode.WITHDRAW_ALL:
        yield this.onWithdrawAll()
        break
    }
  }

  @flow *onWithdrawAll() {
    this.withdrawAllLoading = true

    if (!this.lock?.balance) {
      this.toastService.error('Lock balance is zero.')
      return
    }

    try {
      const amountUsdc = this.lock.balance
      yield this.lockService.withdrawLock({ uid: this.uid, amountUsdc })

      this.navigationService.replace('LockCreateResult', {
        mode: this.mode,
        uid: this.uid,
        initialDepositUsdc: amountUsdc,
        untilDate: this.formattedLockSelectedUntilDate,
      })
    } catch (err) {
      this.handleError(err)
    } finally {
      this.withdrawAllLoading = false
    }
  }

  private handleError(err) {
    if (err instanceof ConnectionError) {
      this.toastService.error('Service Temporary Unavailable')
    } else if (
      err instanceof RequestError &&
      (err.statusCode === StatusCode.ServerError || err.statusCode === StatusCode.BadRequest)
    ) {
      this.toastService.error('Service Temporary Unavailable')
    } else {
      this.monitoringService.exception(err)
      this.toastService.error('Oops, something went wrong. Please, try again', 5000)
    }
  }
}

const INCREMENT_STEP = 10
export const MAX_LOCK_DAYS = 3650
export const MIN_LOCK_DAYS = 7
