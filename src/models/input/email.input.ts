import { readable } from '@ts-awesome/model-reader'

export class EmailInput {
  @readable(String) email!: string
}
