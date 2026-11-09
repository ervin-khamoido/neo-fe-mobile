import { readable } from '@ts-awesome/model-reader'

export class ValidateOutput {
  @readable(Boolean) valid!: boolean
  @readable([String], true) errors?: string[]
}
