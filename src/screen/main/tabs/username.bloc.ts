import { inject, injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'
import { InvalidUsernameError } from '../../../models/error/invalid-username.error'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { UsernameInput } from '../../auth/sign-up-details/widget/username.bloc'
import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { StatusCode } from '../../../common/constrants'

@breadcrumb('Username')
@injectable()
export class UsernameBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(UserServiceSymbol) userService!: IUserService
  @inject(ToastServiceSymbol) toast!: IToastService

  @observable data: UsernameInput = {
    username: null,
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onChange<T>(value: string) {
    this.data.username = value
  }

  async onSubmit() {
    try {
      await this.userService.createUsername(this.data.username)
      await this.userService.syncMe()

      this.toast.success('Username has been created')
      this.navigationService.back()
    } catch (err) {
      if (err instanceof InvalidUsernameError) {
        throw err
      } else if (err instanceof ConnectionError) {
        this.toast.error('Services Temporarily Unavailable')
      } else if (err instanceof RequestError && err.statusCode !== StatusCode.BadRequest) {
        throw new InvalidUsernameError(err.message, this.data.username)
      } else if (err.statusCode === StatusCode.BadRequest) {
        throw new InvalidUsernameError(err.message, this.data.username)
      } else {
        this.toast.error('Oops, something went wrong. Please, try again', 10000)
      }
    }
  }
}
