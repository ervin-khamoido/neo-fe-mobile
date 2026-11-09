import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { BankAccountWidgetMode, MainNavigatorDef } from '../../common'
import { BankAccount } from '../../../models'
import { LevelFlowInterruptError } from '../../../models/error/level-flow-interrupt.error'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../services/level/level-one.service'

import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { ILevelService, LevelServiceSymbol } from '../../../services/level/level.service'

@breadcrumb('Saved Bank Accounts')
@injectable()
export class SavedBankAccountsBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(AppMonitoringServiceSymbol) @named('DeleteBank') monitoring!: IMonitoringService

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(LevelServiceSymbol) levelService!: ILevelService

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(UserStoreSymbol) userStore!: IUserStore

  @observable loadingBankAccount: string | null = null
  @observable isMultiple: boolean = false
  @observable bankAccountsToDelete: Array<string> = []
  @observable showDeleteModal: boolean = false
  @observable isDeleting: boolean = false
  @observable deleteLoading = false

  @computed get loading() {
    return !!this.loadingBankAccount
  }

  @computed get banks() {
    return this.userStore.userBanks
  }
  @computed get disableDelete() {
    return this.bankAccountsToDelete.length === 0
  }
  @computed get savedBanksExist() {
    return this.banks?.length > 0
  }
  @action onIsDeleting() {
    this.bankAccountsToDelete = []
    this.isMultiple = false
    this.isDeleting = !this.isDeleting
  }
  @action onDeleteBankAccountsToggle() {
    this.showDeleteModal = !this.showDeleteModal
  }
  @action onSelectBankAccountsToDelete(bankAccount: BankAccount) {
    let newBanksToDelete = [...this.bankAccountsToDelete]
    if (newBanksToDelete.includes(bankAccount.uid)) {
      newBanksToDelete.splice(newBanksToDelete.indexOf(bankAccount.uid), 1)
    } else {
      newBanksToDelete.push(bankAccount.uid)
    }
    this.bankAccountsToDelete = newBanksToDelete
    this.bankAccountsToDelete.length > 1 ? (this.isMultiple = true) : (this.isMultiple = false)
  }
  @action onIsChecked(bankAccount: BankAccount) {
    return this.bankAccountsToDelete.includes(bankAccount.uid)
  }
  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @flow *onAddBankAccount() {
    const canProceed = yield this.levelOneFlow()
    if (!canProceed) {
      return
    }

    try {
      yield this.userService.syncBanks()
      this.navigationService.navigate('AddBankAccount2', {
        mode: BankAccountWidgetMode.SavedAccounts,
        cta: 'Save Bank Account',
      })
    } catch (err) {
      if (err.message === 'userCanceled') {
        // ignore
      } else {
        this.toast.error(err.message)
      }
    }
  }

  @flow private *levelOneFlow() {
    try {
      yield this.levelOneService.triggerFlow(false, true)
      yield this.levelOneService.waitCurrentFlow()

      return true
    } catch (err) {
      if (err instanceof LevelFlowInterruptError) {
        // user has interrupted the flow -> analytics?
        return false // user can't proceed
      } else {
        // something went wrong
        this.toast.error(err.message)
        return false // user can't proceed
      }
    }
  }

  onBankAccount(bankAccount: BankAccount) {
    this.navigationService.navigate('BankAccountDetails', { uid: bankAccount.uid })
  }

  @flow *onConfirmDeleteBankAccounts() {
    this.deleteLoading = true

    try {
      yield this.userService.sendDeleteUserBankAccounts(this.bankAccountsToDelete)
      yield this.userService.syncBankAccounts()
    } catch (err) {
      this.toast.error(err.message)
    } finally {
      this.showDeleteModal = false
      this.isDeleting = false
      this.deleteLoading = false
    }
  }
}
