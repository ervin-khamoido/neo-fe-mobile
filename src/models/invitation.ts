import { readable } from '@ts-awesome/model-reader'

export class LinkInvitation {
  @readable(String) referrerCode!: string
}
