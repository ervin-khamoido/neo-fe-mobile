import { readable } from '@ts-awesome/model-reader'

export class Auth {
  @readable(String, true) token?: string
  @readable(Boolean) exists!: boolean
  @readable(Boolean) verified!: boolean
}

export class FirebaseAuth {
  @readable(String) firebaseCustomToken!: string
}

export enum VerifyingType {
  Phone = 'phone',
  Email = 'email',
}
