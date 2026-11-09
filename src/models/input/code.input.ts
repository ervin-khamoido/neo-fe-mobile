import { readable } from '@ts-awesome/model-reader'

export class CodeInput {
  @readable(String) code!: string
}
