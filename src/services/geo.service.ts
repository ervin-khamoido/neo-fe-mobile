import { inject, injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'
import { ConnectionError, HttpTransportSymbol, IHttpTransport } from '@ts-awesome/request'
import { GoogleConfigSymbol, IGoogleConfig } from '../models/config/google.config'
import { CountryStateCity } from '../utils/country-state-city'
import { Country, ICity, ICountry, IState, State } from '../utils/country-state-city/typing'
import { PlaceAutocompleteResponse, PlacesStatus, PlacePrediction } from '../models/google/places'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { PlaceDetails, PlaceDetailsResponse } from '../models/google/place-details'

export interface IGeoService {
  getStatesOfCountry(isoCode: string): IState[]
  getCitiesOfState(countryIsoCode: string, stateIsoCode: string): ICity[]

  searchAddress(payload: PlacesPayload): Promise<PlacePrediction[]>
  fetchPlace(placeId: string): Promise<PlaceDetails | null>
}

export const GeoServiceSymbol = Symbol.for('IGeoService')

@injectable()
export class GeoService implements IGeoService {
  static readonly countries: ICountry[] = CountryStateCity.getAllCountries()
  static readonly countryCodes = GeoService.countries.map(x => x.isoCode)

  static readonly states: IState[] = CountryStateCity.getAllStates()
  static readonly stateCodes = GeoService.states.map(x => x.isoCode)

  static readonly cities: ICity[] = CountryStateCity.getAllCities()
  static readonly cityNames = GeoService.cities.map(x => x.name)

  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(HttpTransportSymbol) http!: IHttpTransport
  @inject(GoogleConfigSymbol) googleConfig!: IGoogleConfig

  getStatesOfCountry(isoCode: Country): IState[] {
    return CountryStateCity.getCountryStates(isoCode)
  }

  getCitiesOfState(countryIsoCode: Country, stateIsoCode: State): ICity[] {
    return CountryStateCity.getStateCities(countryIsoCode, stateIsoCode)
  }

  private currentPlacesSession: string | null = null

  async searchAddress(payload: PlacesPayload): Promise<PlacePrediction[]> {
    if (!payload.input.trim()) {
      return []
    }

    if (!this.currentPlacesSession) {
      this.currentPlacesSession = uuidv4()
    }

    const searchParams = new URLSearchParams({
      input: payload.input,
      components: `country:${payload.countryIsoCode.toLowerCase()}`,
      language: 'en',
      sessiontoken: this.currentPlacesSession,
      key: this.googleConfig.placesApiKey,
    })
    const url = `${GOOGLE_API_URL}/place/autocomplete/json?${searchParams}`
    try {
      const results = await this.http.get(url, { Model: PlaceAutocompleteResponse })

      switch (results.status) {
        case PlacesStatus.OK:
        case PlacesStatus.ZeroResults:
          return results.predictions
        case PlacesStatus.InvalidRequest:
        case PlacesStatus.OverQueryLimit:
        case PlacesStatus.RequestDenied:
        case PlacesStatus.UnknownError:
          this.monitoring.exception(
            `unexpected: google places api returned with a status ${results.status}. message: ${results.errorMessage}. payload: ${payload}.`,
          )
          return []
      }
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }

      return []
    }
  }

  async fetchPlace(placeId: string): Promise<PlaceDetails | null> {
    if (!this.currentPlacesSession) {
      this.monitoring.exception('unexpected: possible misuse of places session')
    }

    const searchParams = new URLSearchParams({
      place_id: placeId,
      fields: 'formatted_address,place_id',
      sessiontoken: this.currentPlacesSession,
      key: this.googleConfig.placesApiKey,
    })
    const url = `${GOOGLE_API_URL}/place/details/json?${searchParams}`
    try {
      const response = await this.http.get(url, { Model: PlaceDetailsResponse })

      switch (response.status) {
        case PlacesStatus.OK:
        case PlacesStatus.ZeroResults:
          return response.result
        case PlacesStatus.InvalidRequest:
        case PlacesStatus.OverQueryLimit:
        case PlacesStatus.RequestDenied:
        case PlacesStatus.UnknownError:
          this.monitoring.exception(
            `unexpected: google places details api returned with a status ${response.status}. message: ${response.errorMessage}.`,
          )
          return null
      }
    } catch (err) {
      if (err instanceof ConnectionError) {
        // ignore
      } else {
        this.monitoring.exception(err)
      }

      return null
    } finally {
      this.currentPlacesSession = null
    }
  }
}

const GOOGLE_API_URL = 'https://maps.googleapis.com/maps/api'

type PlacesPayload = {
  input: string
  // radiusInMeters: number // meters
  countryIsoCode: string
}
