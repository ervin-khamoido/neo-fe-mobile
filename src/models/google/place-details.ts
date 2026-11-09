import { readable } from '@ts-awesome/model-reader'
import { PlacesStatus } from './places'

export class PlaceDetails {
  @readable('formatted_address', String) address!: string
  @readable('place_id', String) placeId!: string
}

export class PlaceDetailsResponse {
  @readable(PlaceDetails) result!: PlaceDetails
  @readable(String) status!: PlacesStatus

  @readable('error_message', String, true) errorMessage?: string
  @readable('info_messages', [String], true) infoMessages?: string[]
}
