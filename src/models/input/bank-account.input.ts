import { readable } from '@ts-awesome/model-reader'

export class BankAccountInput {
  @readable(String) bank!: string
  @readable(String) bankAccountNumber!: string
  @readable(String, true) userName?: string
}
