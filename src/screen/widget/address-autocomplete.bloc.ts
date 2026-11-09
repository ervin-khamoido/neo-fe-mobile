import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import _ from 'lodash'

import { IBLoC } from '../../ioc'
import { PlacePrediction } from '../../models/google/places'
import { PlaceDetails } from '../../models/google/place-details'

import { GeoServiceSymbol, IGeoService } from '../../services/geo.service'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { InitialPropsSymbol } from '../../ioc/component.scope'

import { PlaceAutocompleteWidgetProps } from './address-autocomplete.widget'

@injectable()
export class AddressAutocompleteBLoC implements IBLoC<PlaceAutocompleteWidgetProps> {
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(GeoServiceSymbol) geoService!: IGeoService

  @inject(InitialPropsSymbol) @observable props!: PlaceAutocompleteWidgetProps

  @observable loading = false
  @computed get isVisible() {
    return this.props.show
  }
  @observable searchResults: PlacePrediction[] = []
  @observable search: string = ''

  constructor() {
    makeObservable(this)

    this.triggerPlaceSearch = _.debounce(this.triggerPlaceSearch.bind(this), SEARCH_DEBOUNCE_TIMEOUT)
  }

  @action onParamsChange(props: PlaceAutocompleteWidgetProps) {
    this.props = props
  }

  @action onSearch(value: string): void {
    this.search = value

    this.triggerPlaceSearch()
  }

  @flow private *triggerPlaceSearch() {
    this.loading = true
    this.searchResults = yield this.geoService.searchAddress({
      input: this.search,
      countryIsoCode: this.props.countryIsoCode,
    })

    if (this.search.trim()) {
      this.searchResults.unshift({
        placeId: 'raw_input',
        structuredFormatting: {
          mainText: 'Use the entered Address as is:',
          secondaryText: this.search,
        },
        description: this.search,
      })
    }

    this.loading = false
  }

  @flow *onItem(placeId: AddressInput) {
    if (placeId === 'raw_input') {
      this.props.onAddressSelect(this.search)
      return
    }

    const place: PlaceDetails = yield this.geoService.fetchPlace(placeId)
    if (place) {
      this.props.onAddressSelect(place.address)
    } else {
      this.toast.error('Unable to pick that place. Please, try again later')
    }
  }

  @action onBack() {
    this.props.onDismiss()
  }
}

const SEARCH_DEBOUNCE_TIMEOUT = 800
type AddressInput = string | 'raw_input'
