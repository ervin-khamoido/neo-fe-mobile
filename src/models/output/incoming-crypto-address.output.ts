import { readable } from '@ts-awesome/model-reader'

export class IncomingCryptoAddressOutput {
  @readable(String, true) address?: string | null
}
