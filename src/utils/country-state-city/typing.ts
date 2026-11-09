import { NG_State } from './data/ng/cities'

export enum Country {
  NG = 'NG',
}

export type State = NG_State // | US_State | FR_Province ....

export interface ICountry {
  name: string
  phonecode: string
  isoCode: Country
  flag: string
}

export interface IState {
  name: string
  isoCode: State
  countryCode: Country
}

export interface ICity {
  name: string
  countryCode: Country
  stateCode: State
}

export type CountryStateCityData = {
  countries: ICountry[]
  details: {
    [key in Country]: {
      states: IState[]
      cities: {
        [key in State]: ICity[]
      }
    }
  }
}
