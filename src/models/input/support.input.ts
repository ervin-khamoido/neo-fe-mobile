import { readable } from '@ts-awesome/model-reader'

export class SupportInput {
  @readable(String) issue!: string
  @readable(String) description!: string
}
