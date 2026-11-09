import { readable } from '@ts-awesome/model-reader'
import { CurrencyCode } from '../common/constrants'

export class UserBalance {
  @readable(Number) balance!: number
  @readable(String) currency!: CurrencyCode
}

export class YieldBalance {
  @readable(Number) balance!: number
  @readable(String) currency!: string
  @readable(Date) dueDate!: Date
}
