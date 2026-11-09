import React, { memo, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'

import ioc from '../ioc'
import { sizes } from '../common/constrants'
import { colors } from '../common/colorV2'
import { fonts } from '../common/typeface'

import { BottomModal } from '../component/modals/bottom-modal'
import { SearchInput } from '../component/form/search-input'
import { ModalMonitor } from './modal-monitor.widget'

import { BaseItem, SelectBLoC, SpecialItem } from './select.bloc'

const ChevronLeft = require('../../assets/images/chevron-left.icon.svg')

export type SelectWidgetProps<T> = {
  name: string
  value: string
  placeholder?: string
  items: T[]
  disabled?: boolean

  textStyle?: Text['props']
  textPlaceholderStyle?: Text['props']

  onChange: (name: string, value: string) => void
  valueSelector: (item: T) => string
  titleSelector: (item: T) => string
  searchHandler: (search: string, items: T[]) => T[]

  enableToSelectTheInput?: boolean
}
export const SelectWidget = observer((props: SelectWidgetProps<unknown>) => {
  const bloc = ioc.useBLoC<SelectBLoC<unknown>, SelectWidgetProps<unknown>>(SelectBLoC, props)

  const { valueSelector, titleSelector, textStyle, textPlaceholderStyle, disabled } = props

  const txtStyle = useMemo(() => [styles.inputText, textStyle], [textStyle])
  const txtPlaceholderStyle = useMemo(() => [styles.inputPlaceholder, textPlaceholderStyle], [textPlaceholderStyle])

  const onSelectPress = useCallback(() => bloc.onSelectPress(), [bloc])
  const onPopUpClose = useCallback(() => bloc.onPopUpClose(), [bloc])
  const onSearchChange = useCallback((_, value) => bloc.onSearchChange(value), [bloc])
  const onItemPress = useCallback(item => bloc.onItemSelect(item), [bloc])

  const renderItem: ListRenderItem<unknown> = ({ item }) => (
    <ListItem item={item} onPress={onItemPress} titleSelector={titleSelector} />
  )

  return (
    <TouchableOpacity style={styles.input} disabled={disabled} onPress={onSelectPress}>
      {bloc.value ? (
        <Text style={txtStyle} ellipsizeMode={'tail'}>
          {bloc.title}
        </Text>
      ) : (
        <Text style={txtPlaceholderStyle}>{bloc.placeholder}</Text>
      )}

      {!disabled && <VectorImage style={styles.chevron} width={28} height={28} source={ChevronLeft} />}

      <BottomModal visible={bloc.showList} swipeable onSwipeDown={onPopUpClose} onBackdropPress={onPopUpClose}>
        <SearchInput name="search" value={bloc.search} placeholder="Search" onChange={onSearchChange} />
        <FlatList<unknown>
          style={styles.list}
          contentContainerStyle={styles.listContainer}
          data={bloc.items}
          renderItem={renderItem}
          keyExtractor={valueSelector}
          ItemSeparatorComponent={Separator}
          keyboardShouldPersistTaps="always"
        />
      </BottomModal>
      <ModalMonitor isVisible={bloc.showList} hostComponentName={bloc.placeholder} modalName="Select Options" />
    </TouchableOpacity>
  )
})

const Separator = memo(() => <View style={styles.hr} />)

type ListItemProps<T extends BaseItem> = {
  item: T | SpecialItem
  titleSelector: (item: T) => string
  onPress: (item: T | SpecialItem) => void
}
const ListItem = memo(<T extends BaseItem>({ item, titleSelector, onPress }: ListItemProps<T>) => {
  const onItemPress = useCallback(() => onPress(item), [item, onPress])

  return (
    <TouchableOpacity onPress={onItemPress}>
      <Text style={styles.listItemTxt}>{item.specialItem ? item.label : titleSelector(item as T)}</Text>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  input: {
    flex: 0,
    ...fonts.h2Regular,
    color: colors.text,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    ...fonts.h2Regular,
    color: colors.text,
    width: '90%',
  },
  inputPlaceholder: {
    ...fonts.h2Regular,
    color: colors.textSecondary2,
  },
  chevron: {
    transform: [{ rotate: '-90deg' }],
    tintColor: colors.textSecondary2,
    width: 28,
    height: 28,
  },
  list: {
    height: '70%',
    marginHorizontal: -sizes.margin,
  },
  listContainer: {
    paddingHorizontal: sizes.margin,
  },
  listItemTxt: {
    ...fonts.h2Regular,
    color: colors.text,
    paddingVertical: 16,
  },
  hr: {
    height: 0,
    borderBottomColor: colors.border2,
    borderBottomWidth: 1,
  },
})
