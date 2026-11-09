import { readable } from '@ts-awesome/model-reader'

import { IAddress } from '../user'
import { Country } from '../../utils/country-state-city/typing'

export class SignUpInput {
  @readable(String, true) referrerCode?: string | null
  @readable(String) firstName!: string
  @readable(String, true) middleName?: string | null
  @readable(String) lastName!: string
  @readable(Date) dateOfBirth!: Date
  @readable(String) country!: Country
  @readable(Object, true) address!: IAddress | null
  @readable(String) username!: string
}
