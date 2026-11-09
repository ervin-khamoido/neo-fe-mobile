import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { IBLoC } from '../../ioc'
import { InitialPropsSymbol } from '../../ioc/component.scope'

import { IUserStore, UserStoreSymbol } from '../../services/store/user.store'
import { AvatarWidgetProps } from './avatar.widget'

@injectable()
export class AvatarBLoC implements IBLoC<AvatarWidgetProps> {
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(InitialPropsSymbol) @observable props!: AvatarWidgetProps

  @computed get avatarUrl() {
    return this.userStore.me?.userDetails?.avatarUrl
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(props: AvatarWidgetProps) {
    this.props = props
  }

  onChangeAvatar() {
    /* TODO: add photo update functionality */
  }
}
