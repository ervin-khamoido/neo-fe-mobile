import { readable } from '@ts-awesome/model-reader'

export class VerifyOutput {
  @readable(Boolean) result!: boolean
  @readable(String, true) reason?: string | null
}
