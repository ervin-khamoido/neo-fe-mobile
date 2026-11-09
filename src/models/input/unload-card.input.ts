import { readable } from '@ts-awesome/model-reader'

export class UnloadCardInput {
  @readable(Number) amount!: number
}
