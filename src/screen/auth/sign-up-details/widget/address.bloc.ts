import { inject, injectable } from 'inversify'
import { action, computed, flow, IReactionDisposer, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'

import { IBLoC } from '../../../../ioc'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { requiredMessage } from '../../../../utils/validation'
import { IAddress } from '../../../../models'
import { FormErrors, FormFieldName, isValidForm, validateForm } from '../../../../lib/utils/form'

import { GeoService, GeoServiceSymbol, IGeoService } from '../../../../services/geo.service'

import { AddressWidgetProps } from './address.widget'
import { ICity, ICountry, IState } from '../../../../utils/country-state-city/typing'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'

@injectable()
export class AddressBLoC implements IBLoC<AddressWidgetProps> {
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(GeoServiceSymbol) geoService!: IGeoService

  @inject(InitialPropsSymbol) @observable props!: AddressWidgetProps

  private disposer?: IReactionDisposer

  @observable skipLoading = false
  @observable loading = false

  @observable touched = false
  @computed get data(): IAddress {
    return this.props.data
  }
  @observable error: FormErrors<IAddress> = {}

  @observable isConfirmModalVisible = false

  @computed get countries(): ICountry[] {
    return GeoService.countries
  }

  @computed get states(): IState[] {
    const { country } = this.data ?? {}
    const states = country ? this.geoService.getStatesOfCountry(country) : []

    return states.sort((a, b) => a.name.localeCompare(b.name))
  }

  @computed get cities(): ICity[] {
    const { country, state } = this.data ?? {}
    const cities = country && state ? this.geoService.getCitiesOfState(country, state) : []

    return cities.sort((a, b) => a.name.localeCompare(b.name))
  }

  @computed get skippable() {
    return !!this.props.onSkip
  }

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  initialize() {
    this.disposer = reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )
  }

  @action onParamsChange(props: AddressWidgetProps) {
    this.props = props
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    this.props.onChange(name, value)
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(AddressInputSchema, this.data)
    }
  }

  @flow *onSubmit() {
    this.touched = true
    this.loading = true

    const isValid = yield isValidForm(AddressInputSchema, this.data)
    if (!isValid) {
      this.loading = false
      return
    }

    try {
      yield this.props.onSubmit()
    } catch (err) {
      this.toast.error(err.message)
    } finally {
      this.loading = false
    }
  }

  @flow *onSkip() {
    this.skipLoading = true

    try {
      yield this.props.onSkip()
    } catch (err) {
      this.toast.error(err.message)
    } finally {
      this.skipLoading = false
    }
  }

  @observable showAddressAutocomplete = false

  @action onAddressPress() {
    this.showAddressAutocomplete = true
  }

  @action onAddressChange(value: string) {
    this.data.addressLine = value
    this.showAddressAutocomplete = false
  }

  @action onAddressDismiss() {
    this.showAddressAutocomplete = false
  }

  onDestroy() {
    this.disposer?.()
  }
}

const CountryLabel = 'Country'
const StateLabel = 'State'
const CityLabel = 'City'
const AddressLabel = 'Address'

const AddressInputSchema = yup.object().shape({
  country: yup.string().required(requiredMessage(CountryLabel)).oneOf(GeoService.countryCodes).label(CityLabel),
  state: yup
    .string()
    .required(requiredMessage(StateLabel))
    .oneOf(GeoService.stateCodes, requiredMessage(StateLabel))
    .label(StateLabel),
  city: yup.string().required(requiredMessage(CityLabel)).label(CityLabel),
  addressLine: yup.string().required(requiredMessage(AddressLabel)).label(AddressLabel),
  postalCode: yup.string().nullable(),
  comment: yup.string().nullable(),
})
