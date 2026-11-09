import { readable } from '@ts-awesome/model-reader'

export class FundCardInput {
  @readable(Number) amount!: number
}
