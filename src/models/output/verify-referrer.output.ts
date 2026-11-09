import { readable } from '@ts-awesome/model-reader'

export class ReferrerVerifyOutput {
  @readable(Boolean) verified!: boolean
  @readable(String, true) reason?: string | null
}
