import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react-lite'

import ioc from '../../../../ioc'
import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer } from '../../../../component/spacer'
import { Input } from '../../../../component/form/input-v2'
import { Button, OutlineButton } from '../../../../component/button-v2'

import { AddressBLoC } from './address.bloc'
import { SelectWidget } from '../../../../widget/select.widget'
import { FormFieldName } from '../../../../lib/utils/form'
import { Field } from '../../../../component/form/field'
import { IAddress } from '../../../../models'
import { AddressAutocompleteWidget } from '../../../widget/address-autocomplete.widget'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { ICity, ICountry, IState } from '../../../../utils/country-state-city/typing'

export type AddressWidgetProps = {
  data?: IAddress | null
  onChange: <T>(name: FormFieldName, value: T) => void
  onSubmit: () => unknown
  onSkip?: () => unknown
}

export const AddressWidget = observer<AddressWidgetProps>(props => {
  const bloc = ioc.useBLoC(AddressBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSkip = useCallback(() => bloc.onSkip(), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  const onAddressPress = useCallback(() => bloc.onAddressPress(), [bloc])
  const onAddressChange = useCallback(value => bloc.onAddressChange(value), [bloc])
  const onAddressDismiss = useCallback(() => bloc.onAddressDismiss(), [bloc])

  return (
    <KeyboardAwareScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Address</Text>
      <Spacer height={24} />

      <Field error={bloc.error.country}>
        <SelectWidget
          name="country"
          value={bloc.data?.country}
          items={bloc.countries}
          disabled
          titleSelector={countryTitleSelector}
          valueSelector={countryValueSelector}
          onChange={onChange}
          searchHandler={countrySearch}
          placeholder="Select Country"
        />
      </Field>
      <Spacer height={40} />

      <Field error={bloc.error.state}>
        <SelectWidget
          name="state"
          value={bloc.data?.state}
          items={bloc.states}
          disabled={bloc.states.length === 0}
          titleSelector={stateTitleSelector}
          valueSelector={stateValueSelector}
          onChange={onChange}
          searchHandler={stateSearch}
          placeholder="Select State"
        />
      </Field>
      <Spacer height={40} />

      {!!bloc.data?.state && (
        <>
          <Field error={bloc.error.city}>
            <SelectWidget
              name="city"
              value={bloc.data?.city}
              items={bloc.cities}
              disabled={bloc.cities.length === 0}
              titleSelector={cityTitleSelector}
              valueSelector={cityValueSelector}
              onChange={onChange}
              searchHandler={citySearch}
              placeholder="Select City"
              enableToSelectTheInput
            />
          </Field>
          <Spacer height={40} />
        </>
      )}

      <Field error={bloc.error.addressLine}>
        <TouchableOpacity onPress={onAddressPress}>
          {bloc.data?.addressLine ? (
            <Text style={styles.addressInputTxt}>{bloc.data?.addressLine}</Text>
          ) : (
            <Text style={styles.addressInputPlaceholder}>Address</Text>
          )}
        </TouchableOpacity>

        <AddressAutocompleteWidget
          show={bloc.showAddressAutocomplete}
          countryIsoCode={bloc.data?.country}
          onAddressSelect={onAddressChange}
          onDismiss={onAddressDismiss}
        />
      </Field>
      <Spacer height={40} />

      <Field error={bloc.error.postalCode}>
        <Input
          style={styles.postalCodeInput}
          name="postalCode"
          value={bloc.data?.postalCode}
          placeholder="Postal Code"
          onChange={onChange}
        />
      </Field>
      <Spacer height={40} />

      <Spacer height={-1} />

      {bloc.skippable && (
        <>
          <OutlineButton
            title="Skip"
            loading={bloc.skipLoading}
            disabled={bloc.loading || bloc.skipLoading}
            onPress={onSkip}
          />
          <Spacer height={16} />
        </>
      )}

      <Button title="Next" loading={bloc.loading} disabled={bloc.loading || bloc.skipLoading} onPress={onSubmit} />
      <Spacer height={24} />
    </KeyboardAwareScrollView>
  )
})

const countryTitleSelector = (item: ICountry) => `${item.flag} ${item.name}`
const countryValueSelector = (item: ICountry) => item.isoCode
const countrySearch = (search: string, items: ICountry[]) =>
  items.filter(x => {
    const searchValue = search?.toLowerCase()
    const nameValue = x.name.toLowerCase()
    const iosCodeValue = x.isoCode.toLowerCase()

    return nameValue.includes(searchValue) || iosCodeValue.includes(searchValue)
  })

const stateTitleSelector = (item: IState) => item.name
const stateValueSelector = (item: IState) => item.isoCode
const stateSearch = (search: string, items: IState[]) =>
  items.filter(x => {
    const searchValue = search?.toLowerCase()
    const nameValue = x.name.toLowerCase()
    const iosCodeValue = x.isoCode.toLowerCase()

    return nameValue.includes(searchValue) || iosCodeValue.includes(searchValue)
  })

const cityTitleSelector = (item: ICity) => item.name
const cityValueSelector = (item: ICity) => item.name
const citySearch = (search: string, items: ICity[]) =>
  items.filter(x => {
    const searchValue = search?.toLowerCase()
    const nameValue = x.name.toLowerCase()

    return nameValue.includes(searchValue)
  })

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  addressInputTxt: {
    ...fonts.h2Regular,
    lineHeight: 32,
    color: colors.text,
  },
  addressInputPlaceholder: {
    ...fonts.h2Regular,
    lineHeight: 32,
    color: colors.textSecondary2,
  },
  postalCodeInput: {
    marginLeft: -4,
  },
})
