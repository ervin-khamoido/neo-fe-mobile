import { injectable } from 'inversify'
import { action, makeObservable, observable } from 'mobx'

import { LinkInvitation } from '../../models'
import { cleanable, ICleanable } from '../../utils/sanitizer'

export interface IGeoStore {
  readonly invitationContext: LinkInvitation | null

  setCurrentInvite(invitation: LinkInvitation): void
  resetCurrentInvite(): void
}

export const InvitationStoreSymbol = Symbol.for('IInvitationStore')

@cleanable
@injectable()
export class GeoStore implements IGeoStore, ICleanable {
  @observable invitationContext: LinkInvitation | null = null

  constructor() {
    makeObservable(this)
  }

  @action setCurrentInvite(invitation: LinkInvitation): void {
    this.invitationContext = invitation
  }

  @action resetCurrentInvite(): void {
    this.invitationContext = null
  }

  @action clean(): void {
    this.invitationContext = null
  }
}
