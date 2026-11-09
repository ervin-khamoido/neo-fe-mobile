import { readable } from '@ts-awesome/model-reader'

export class Lock {
  @readable(String) uid!: string
  @readable(String, true) name?: string
  @readable(Number) balance!: number
  @readable(String) status!: LockStatus
  @readable(Number) withdrawalPercentageFee!: number
  @readable(Date) expiresAt!: Date
  @readable(Date, true) expiredAt?: Date | null
  @readable(String) createdAt!: Date
}

export enum LockStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export class LockInput {
  @readable(String) name!: string
  @readable(Number) durationInDays!: number
  @readable(Number) initialDepositUsdc!: number
}

export class LockOrderInput {
  @readable(String) uid!: string
  @readable(Number) amountUsdc!: number
}

export enum LockAmountMode {
  Create = 'create',
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

export enum LockWithdrawalMode {
  WITHDRAW = 'withdraw',
  WITHDRAW_ALL = 'withdraw_all',
}
