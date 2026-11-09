import { inject, injectable } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IPINService, OneTimeAction, PINServiceSymbol } from '../../../services/pin.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { PIN_CODE_SIZE } from '../../../common/constrants'
import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'
import { BadRequestContextType } from '../../../services/api.service'
import { breadcrumb } from '../../../utils/breadcrumb'
import { HapticServiceSymbol, IHapticService } from '../../../services/haptic.service'

export enum ChangePINState {
  Current = 'current',
  New = 'new',
  ReEnter = 're-enter',
  Success = 'success',
}

@breadcrumb('Change PIN')
@injectable()
export class ChangePINBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(HapticServiceSymbol) haptic!: IHapticService

  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow

  @observable loading = false

  @observable state = ChangePINState.Current
  @observable code = ''

  @observable currentPIN = ''
  @observable newPIN = ''

  @observable error = ''

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onDigitInput(value: string) {
    this.haptic.tapNumpad()
    this.error = ''
    if (this.code.length === PIN_CODE_SIZE) {
      return
    }

    this.code = `${this.code}${value}`
  }

  @action onDigitRemove() {
    this.haptic.tapNumpad()
    this.error = ''
    if (this.code.length === 0) {
      return
    }

    this.code = this.code.slice(0, -1)
  }

  @flow *onSubmit() {
    switch (this.state) {
      case ChangePINState.Current:
        yield this.requestChangePinAction()
        break
      case ChangePINState.New:
        this.newPIN = this.code
        this.code = ''
        this.state = ChangePINState.ReEnter
        break
      case ChangePINState.ReEnter:
        yield this.submit()
        break
    }
  }

  @flow *requestChangePinAction() {
    this.loading = true

    try {
      yield this.pinService.requestOneTimeToken(this.code, OneTimeAction.ChangePin)

      this.state = ChangePINState.New
    } catch (err) {
      this.error = err?.message
      this.state = ChangePINState.Current
      this.haptic.invalidInput()
    } finally {
      this.loading = false
      this.code = ''
    }
  }

  @flow *submit() {
    if (this.code !== this.newPIN) {
      this.error = 'PINs do not match'
      this.code = ''
      return
    }

    this.loading = true

    try {
      yield this.oneTimeActionFlow.processOneTimeAction(() => this.pinService.changePIN(this.code))

      this.navigationService.back()

      this.toast.success('🎉  Your new secure PIN has been set')
    } catch (err) {
      if (err?.data && err?.data.type === BadRequestContextType.ValidationMessage) {
        this.error = err.data.data
        this.haptic.invalidInput()
      } else {
        this.toast.error(err?.message ?? 'Something went wrong')
      }
    } finally {
      this.loading = false
      this.code = ''
      this.state = ChangePINState.Current
    }
  }
}
