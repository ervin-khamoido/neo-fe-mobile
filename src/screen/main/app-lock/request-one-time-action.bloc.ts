import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC, IWizardable } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { PIN_CODE_SIZE } from '../../../common/constrants'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IPINService, PINServiceSymbol } from '../../../services/pin.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { IWizardService, WizardServiceSymbol } from '../../../services/wizard.service'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { WizardCloseError } from '../../../models/error/wizard-close.error'
import { breadcrumb } from '../../../utils/breadcrumb'
import { HapticServiceSymbol, IHapticService } from '../../../services/haptic.service'

type OneTimeTokenParams = MainNavigatorDef['RequestOneTimeAction'] & IWizardable

@breadcrumb('Request One Time Action')
@injectable()
export class RequestOneTimeActionBLoC implements IBLoC<unknown, OneTimeTokenParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(WizardServiceSymbol) wizardService!: IWizardService
  @inject(HapticServiceSymbol) haptic!: IHapticService

  @inject(NavigationParamsSymbol) @observable params!: OneTimeTokenParams

  @computed get wizardId() {
    return this.params.wizardId
  }

  @computed get action() {
    return this.params.action
  }

  @observable error = ''
  @observable code = ''

  @observable loading = false

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(_, params: OneTimeTokenParams) {
    this.params = params
  }

  @flow *onDigitInput(value: string) {
    this.haptic.tapNumpad()
    if (this.code.length === PIN_CODE_SIZE) {
      return
    }

    this.error = ''
    this.code = `${this.code}${value}`

    if (this.code.length === PIN_CODE_SIZE) {
      yield this.submit()
    }
  }

  @action onDigitRemove() {
    this.haptic.tapNumpad()
    this.error = ''
    if (this.code.length === 0) {
      return
    }

    this.code = this.code.slice(0, -1)
  }

  @flow *submit() {
    try {
      yield this.pinService.requestOneTimeToken(this.code, this.action)

      this.wizardService.resolve(this.wizardId, true)
      this.navigationService.back()
    } catch (err) {
      this.error = err.message
      this.code = ''

      this.haptic.invalidInput()
    } finally {
    }
  }

  @action onDestroy() {
    if (!this.wizardService.isResolved(this.wizardId)) {
      this.wizardService.reject(this.wizardId, new WizardCloseError())
    }
  }
}
