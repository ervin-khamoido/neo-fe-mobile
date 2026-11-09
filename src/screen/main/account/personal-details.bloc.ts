import { inject, injectable } from 'inversify'
import { computed, makeObservable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { breadcrumb } from '../../../utils/breadcrumb'
import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { formatPhoneNumber, formatUsername } from '../../../utils/helpers'

@breadcrumb('Personal Details')
@injectable()
export class PersonalDetailsBloc implements IBLoC {
  @inject(UserStoreSymbol) userStore!: IUserStore

  @computed get name() {
    return this.userStore.me?.userDetails?.fullName ?? ''
  }

  @computed get email() {
    return this.userStore.me?.email ?? ''
  }

  @computed get phoneNumber() {
    return formatPhoneNumber(this.userStore.me?.phone ?? '')
  }

  @computed get address() {
    const address = this.userStore.me?.userDetails?.address

    if (address) {
      return [address.addressLine, address.postalCode, `${address.city}, ${address.state}`, address.country]
        .filter(x => x)
        .join('\n')
    }

    return null
  }

  @computed get username() {
    return formatUsername(this.userStore.me?.userDetails?.username ?? '')
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
