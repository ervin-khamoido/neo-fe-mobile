import { inject, injectable } from 'inversify'
import { action, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IPINService, PINServiceSymbol } from '../../../services/pin.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { PIN_CODE_SIZE } from '../../../common/constrants'
import { breadcrumb } from '../../../utils/breadcrumb'
import { HapticServiceSymbol, IHapticService } from '../../../services/haptic.service'

export enum EnableLockState {
  Create = 'create',
  ReEnter = 're-enter',
  Success = 'success',
}

@breadcrumb('Enable Lock')
@injectable()
export class EnableLockBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(PINServiceSymbol) pinService!: IPINService

  @inject(HapticServiceSymbol) haptic!: IHapticService

  @observable loading = false

  @observable state = EnableLockState.Create
  @observable code = ''
  @observable inputCode = ''

  @observable error = ''

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @flow *initialize() {}

  @action onParamsChange() {
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
    if (this.state === EnableLockState.Create) {
      this.state = EnableLockState.ReEnter
      this.inputCode = this.code
      this.code = ''
      return
    } else if (this.state === EnableLockState.ReEnter) {
      if (this.code !== this.inputCode) {
        this.error = 'PINs do not match'
        this.code = ''
        this.inputCode = ''
        this.state = EnableLockState.Create

        this.haptic.invalidInput()
      } else {
        yield this.submit()
      }
    }
  }

  @flow *submit() {
    this.loading = true

    try {
      yield this.pinService.createPIN(this.code)

      this.toast.success('🎉  Your new secure PIN has been set')
    } catch (err) {
      this.toast.error(err?.message ?? 'Something went wrong')
    } finally {
      this.loading = false
      this.code = ''
      this.inputCode = ''
      this.state = EnableLockState.Create
    }
  }
}
