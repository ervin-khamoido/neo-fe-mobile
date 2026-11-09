import { readable } from '@ts-awesome/model-reader'

export class PINOutput {
  @readable(String) token!: string
}
