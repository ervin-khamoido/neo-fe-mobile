export class InvalidUsernameError extends Error {
  constructor(message: string, public username: string) {
    super(message)
  }
}
