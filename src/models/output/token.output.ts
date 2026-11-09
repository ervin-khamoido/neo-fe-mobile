import { readable } from '@ts-awesome/model-reader'

export class TokenOutput {
  @readable(String) token!: string
}
