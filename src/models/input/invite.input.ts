import { readable } from '@ts-awesome/model-reader'

export class InviteInput {
  @readable(String, true) email?: string | null
  @readable(String, true) phone?: string | null
}
