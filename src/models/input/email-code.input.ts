import { readable } from '@ts-awesome/model-reader'

export class EmailCodeInput {
  @readable(String) code!: string
}
