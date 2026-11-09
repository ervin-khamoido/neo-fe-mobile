import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { IBLoC, IWizardable } from '../../ioc'
import { MainNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { NavigationParamsSymbol } from '../../ioc/component.scope'
import { IWizardService, WizardServiceSymbol } from '../../services/wizard.service'
import { WizardCloseError } from '../../models/error/wizard-close.error'
import { breadcrumb } from '../../utils/breadcrumb'

type NavParams = MainNavigatorDef['AddBankAccount2'] & IWizardable

@breadcrumb('Add Bank Account')
@injectable()
export class AddBankAccount2BLoC implements IBLoC<unknown, NavParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(WizardServiceSymbol) wizardService!: IWizardService

  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  @computed get wizardId() {
    return this.navParams.wizardId
  }

  @computed get mode() {
    return this.navParams.mode
  }

  @computed get cta() {
    return this.navParams.cta
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @action onDestroy() {
    if (this.wizardId && !this.wizardService.isResolved(this.wizardId)) {
      this.wizardService.reject(this.wizardId, new WizardCloseError())
    }
  }

  onSubmit(uid: string) {
    if (this.wizardId) {
      this.wizardService.resolve<string>(this.wizardId, uid)
    }

    this.navigationService.back()
  }

  onCancel() {
    if (this.wizardId) {
      this.wizardService.reject(this.wizardId, new WizardCloseError())
    }

    this.navigationService.back()
  }
}
