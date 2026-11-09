import { readable } from '@ts-awesome/model-reader'

export class Claims {
  @readable(Number) exp: number
  @readable(Number) nbf: number
  @readable(Number) iat: number

  get expiresAt() {
    return new Date(this.exp)
  }

  get validNotBefore() {
    return new Date(this.nbf)
  }

  get issuedAt() {
    return new Date(this.iat)
  }
}
