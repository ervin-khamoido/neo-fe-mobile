import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'

import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'

type NavParams = MainNavigatorDef['BankAccountDetails']

@breadcrumb('Bank Account Details')
@injectable()
export class BankAccountDetailsBLoC implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(AppMonitoringServiceSymbol) @named('ConfirmDeleteBank') monitoring!: IMonitoringService
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(NavigationParamsSymbol) @observable navParams!: NavParams
  @inject(UserServiceSymbol) userService!: IUserService

  @observable showDeleteModal: boolean = false
  @observable bankAccountToDelete: string = ''
  @observable deleteLoading = false

  @computed get beneficiaryName() {
    return this.userStore.me?.userDetails?.fullName
  }

  @computed get bankAccount() {
    const { userBanks } = this.userStore
    const { uid } = this.navParams

    return userBanks.find(x => x.uid === uid)
  }

  @action onDeleteBankAccountsToggle() {
    this.showDeleteModal = !this.showDeleteModal
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @flow *onConfirmDeleteBankAccounts() {
    this.deleteLoading = true
    try {
      yield this.userService.sendDeleteUserBankAccounts([this.bankAccount.uid])
      yield this.userService.syncBankAccounts()
    } catch (err) {
      this.toast.error(err.message)
    } finally {
      this.showDeleteModal = false
      this.deleteLoading = false
      this.navigationService.navigate('SavedBankAccounts')
    }
  }
}
