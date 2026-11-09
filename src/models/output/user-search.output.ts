import { readable } from '@ts-awesome/model-reader'

export class UserSearchOutput {
  @readable(String) uid!: string
  @readable(String) displayName!: string
  @readable(String, true) username?: string | null
}
