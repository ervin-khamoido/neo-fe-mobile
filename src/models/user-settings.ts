import { readable } from '@ts-awesome/model-reader'

export enum CurrencyType {
  USD = 'USD',
  NGN = 'NGN',
}

export enum UserStatus {
  Active = 'active',
  ApprovalRequired = 'approval_required',
  PinResetRequired = 'pin_reset_required',
  Blocked = 'blocked',
}

export class UserSettings {
  @readable(Boolean) darkMode!: boolean
  @readable(String) defaultCurrency!: CurrencyType
  @readable(Boolean) enableAppLock!: boolean
  @readable(Date) createdAt!: Date
  @readable(Date) updatedAt!: Date
}
