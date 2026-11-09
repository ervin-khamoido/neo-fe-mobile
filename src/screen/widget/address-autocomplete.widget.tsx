import React, { memo, useCallback, useMemo } from 'react'
import { Text, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native'
import { Observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import VectorImage from 'react-native-vector-image'
import { SafeAreaView, Edge } from 'react-native-safe-area-context'

import ioc from '../../ioc'
import { colors, sizes } from '../../common/constrants'
import { fonts } from '../../common/typeface'
import { PlacePrediction } from '../../models/google/places'
import { Country } from '../../utils/country-state-city/typing'

import { SearchInput } from '../../component/form/search-input'
import { Spacer, VSpacer } from '../../component/spacer'

import { AddressAutocompleteBLoC } from './address-autocomplete.bloc'

export type PlaceAutocompleteWidgetProps = {
  show: boolean
  countryIsoCode: Country

  onAddressSelect: (address: string) => void
  onDismiss: () => void
}
export const AddressAutocompleteWidget = memo<PlaceAutocompleteWidgetProps>(props => {
  const bloc = ioc.useBLoC(AddressAutocompleteBLoC, props)

  const onSearchChange = useCallback((_, value) => bloc.onSearch(value), [bloc])
  const onItemPress = useCallback(placeId => bloc.onItem(placeId), [bloc])
  const onBackPress = useCallback(() => bloc.onBack(), [bloc])

  const renderItem: ListRenderItem<PlacePrediction> = ({ item, index }) => (
    <PlacePredictionItem {...item} separatorBottom={index === 0} onItem={onItemPress} />
  )

  const renderSeparator = () => <Spacer height={0} />

  return (
    <Observer>
      {() => (
        <Modal style={styles.container} isVisible={bloc.isVisible}>
          <SafeAreaView style={styles.header} edges={Edges}>
            <TouchableOpacity style={styles.headerBack} onPress={onBackPress}>
              <VectorImage style={styles.headerBackIcon} width={24} height={24} source={BackIconSrc} />
            </TouchableOpacity>
            <VSpacer width={10} />
            <SearchInput
              containerStyle={styles.headerSearch}
              name="search"
              value={bloc.search}
              placeholder="Search address"
              autoFocus
              loading={bloc.loading}
              onChange={onSearchChange}
            />
          </SafeAreaView>

          <FlatList
            style={styles.searchList}
            contentContainerStyle={styles.searchListContainer}
            data={bloc.searchResults}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          />
        </Modal>
      )}
    </Observer>
  )
})

type PlacePredictionItemProps = {
  separatorBottom?: boolean

  onItem: (placeId: string) => void
} & PlacePrediction
const PlacePredictionItem = memo<PlacePredictionItemProps>(props => {
  const { structuredFormatting, placeId, separatorBottom, onItem } = props

  const searchItemStyle = useMemo(
    () => [styles.searchItem, separatorBottom ? styles.searchItemSeparator : {}],
    [separatorBottom],
  )
  const onItemPress = useCallback(() => onItem(placeId), [onItem, placeId])

  return (
    <TouchableOpacity style={searchItemStyle} onPress={onItemPress}>
      <Text style={styles.searchItemPrimary}>{structuredFormatting.mainText}</Text>
      <Text style={styles.searchItemSecondary}>{structuredFormatting.secondaryText}</Text>
    </TouchableOpacity>
  )
})

const Edges: readonly Edge[] = ['top', 'bottom']

const BackIconSrc = require('../../../assets/images/chevron-left.icon.svg')

const keyExtractor = (x: PlacePrediction) => x.placeId

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
  },

  header: {
    flexDirection: 'row',
    paddingLeft: sizes.margin / 2,
    paddingRight: sizes.margin,
  },
  headerBack: {
    flexGrow: 0,
    justifyContent: 'center',
  },
  headerBackIcon: {},
  headerSearch: {
    flexGrow: 1,
  },

  searchList: {
    flex: 1,
  },
  searchListContainer: {
    paddingHorizontal: sizes.margin,
  },
  searchItem: {
    paddingVertical: 10,
  },
  searchItemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchItemPrimary: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  searchItemSecondary: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
  },
})
