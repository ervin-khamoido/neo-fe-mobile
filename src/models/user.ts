import { readable } from '@ts-awesome/model-reader'
import { Country } from '../utils/country-state-city/typing'

export interface IAddress {
  addressLine: string
  city: string
  state: string
  country: Country
  postalCode?: string | null
  comment?: string | null
}

export class UserDetails {
  @readable(String, true) fullName?: string | null
  @readable(String, true) username?: string | null
  @readable(String, true) referrerCode?: string | null
  @readable(String, true) avatarUrl?: string | null
  @readable(Object, true) address?: IAddress | null
  @readable(Boolean) isApproved!: boolean
  @readable(Date, true) createdAt!: Date | null
  @readable(Date) updatedAt!: Date
}

export interface IAddress {
  addressLine: string
  city: string
  state: string
  country: Country
  postalCode?: string | null
  comment?: string | null
}

export class User {
  @readable(String) uid!: string
  @readable(String) fireUserId!: string
  @readable(String) phone!: string
  @readable(String) email!: string
  @readable(Date, true) verifiedAt!: Date | null

  @readable(Date) createdAt!: Date
  @readable(Date) updatedAt!: Date
  @readable(UserDetails, true) userDetails?: UserDetails | null
  @readable(String, true) invitationLink?: string | null
}

// bank is the bank uid
export class Bank {
  @readable(String) uid?: string
  @readable(String) name?: string
}

export class BankAccount {
  @readable(String) bank?: string
  @readable(String) bankAccountNumber?: string

  @readable(String) bankName?: string
  @readable(String) userName!: Object
  @readable(String) bankAccountNumberPublic?: string
  @readable(String) uid?: string
}

export class CanCreateOrder {
  @readable(Boolean) canCreate!: boolean
  @readable(String) reason!: string
}
