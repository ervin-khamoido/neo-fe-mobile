import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import { ConnectionError } from '@ts-awesome/request'

import { IBLoC } from '../../../../ioc'
import { FormFieldName } from '../../../../lib/utils/form'
import { InvalidUsernameError } from '../../../../models/error/invalid-username.error'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'

import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { ApiServiceSymbol, IApiService } from '../../../../services/api.service'

import { UsernameWidgetProps } from './username.widget'
import { AuthContextSymbol } from '../../../../services/context/auth'
import { IAuthContext } from '../../../../services/context/auth/interfaces'

@injectable()
export class UsernameBLoC implements IBLoC<UsernameWidgetProps> {
  @inject(InitialPropsSymbol) @observable props!: UsernameWidgetProps

  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(AuthContextSymbol) authContext!: IAuthContext

  @observable loading = false
  @computed get data() {
    return this.props.data
  }
  @observable error: string | null = null

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(props: UsernameWidgetProps) {
    this.props = props
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.error = null
    this.props.onChange(name, value)
  }

  @flow *onSubmit() {
    this.loading = true

    try {
      yield this.props.onSubmit()
    } catch (err) {
      this.error = err.message
    } finally {
      this.loading = false
    }
  }
}

export type UsernameInput = {
  username: string
}
