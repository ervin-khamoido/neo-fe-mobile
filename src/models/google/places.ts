import { readable } from '@ts-awesome/model-reader'

class Formatting {
  @readable('main_text', String) mainText!: string
  @readable('secondary_text', String) secondaryText!: string
}

export class PlacePrediction {
  @readable(String) description!: string
  @readable('place_id', String) placeId!: string
  @readable('structured_formatting', Formatting) structuredFormatting!: Formatting
}

// https://developers.google.com/maps/documentation/places/web-service/autocomplete#PlacesAutocompleteStatus
export enum PlacesStatus {
  OK = 'OK',
  ZeroResults = 'ZERO_RESULTS',
  InvalidRequest = 'INVALID_REQUEST',
  OverQueryLimit = 'OVER_QUERY_LIMIT',
  RequestDenied = 'REQUEST_DENIED',
  UnknownError = 'UNKNOWN_ERROR',
}

export class PlaceAutocompleteResponse {
  @readable([PlacePrediction]) predictions!: PlacePrediction[]
  @readable(String) status!: PlacesStatus

  @readable('error_message', String, true) errorMessage?: string
  @readable('info_messages', [String], true) infoMessages?: string[]
}
