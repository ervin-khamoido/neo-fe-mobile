import { readable } from '@ts-awesome/model-reader'

export enum ValidationStatus {
  Valid = 'valid',
  Invalid = 'invalid',
  RequireConfirmation = 'require_confirmation',
}

export enum ReasonCode {
  NoMatch = 'no_match',
}

export class ValidateBankAccountOutput {
  @readable(String) status!: ValidationStatus
  @readable(String, true) reason?: string | null
  @readable(String, true) reasonCode?: ReasonCode | null
  @readable(String, true) fullName?: string | null
}
