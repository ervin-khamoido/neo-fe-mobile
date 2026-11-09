import { readable } from '@ts-awesome/model-reader'

export class BalanceFS {
  @readable(Date) updatedAt!: Date
}

export class BalanceVersionFS {
  @readable(Number, true) version?: number | null
}

export class UserFS {
  @readable(BalanceVersionFS, true) balance?: BalanceVersionFS
  @readable(BalanceFS, true) yieldBalance?: BalanceFS
}
