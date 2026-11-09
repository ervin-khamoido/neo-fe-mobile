2021

import { readable } from '@ts-awesome/model-reader'

export class UserFreshchatOutput {
  @readable(String) externalId!: string
  @readable(String, true) restoreId?: string | null
  @readable(String, true) firstName?: string | null
  @readable(String, true) lastName?: string | null
  @readable(String, true) email?: string | null
  @readable(String, true) phone?: string | null
  @readable(Object, true) meta?: Record<string, string | number | boolean>
}
