export class InvalidPhoneError extends Error {
  constructor(message: string, public phone: string) {
    super(message)
  }
}
