import { readable } from '@ts-awesome/model-reader'

export class PINRecord {
  @readable(String) pin!: string
  @readable(Date) lastReadAt!: Date
  @readable(Date, true) expiresAt!: Date | null
}
