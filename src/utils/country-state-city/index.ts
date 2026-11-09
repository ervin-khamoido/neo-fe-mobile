import { Country, ICity, ICountry, IState, State } from './typing'
import Data from './data'

export class CountryStateCity {
  static getAllCountries(): ICountry[] {
    return Data.countries
  }

  static getAllStates(): IState[] {
    const countries = this.getAllCountries()
    const result: IState[] = []

    for (const country of countries) {
      const countryDetails = Data.details[country.isoCode]
      result.push(...countryDetails.states)
    }

    return result
  }

  static getAllCities(): ICity[] {
    const countries = this.getAllCountries()
    const result: ICity[] = []

    for (const country of countries) {
      const countryDetails = Data.details[country.isoCode]
      for (const state of countryDetails.states) {
        const cities = countryDetails.cities[state.isoCode]

        result.push(...cities)
      }
    }

    return result
  }

  static getCountryStates(countryIsoCode: Country): IState[] {
    return Data.details[countryIsoCode].states
  }

  static getStateCities(countryIsoCode: Country, stateIsoCode: State): ICity[] {
    return Data.details[countryIsoCode].cities[stateIsoCode]
  }
}
