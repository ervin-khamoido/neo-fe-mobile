import React, { memo, useCallback, useMemo } from 'react'
import { ActivityIndicator, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'

import { Input, InputProps } from './input'
import { fonts } from '../../common/typeface'
import VectorImage from 'react-native-vector-image'
import { colors } from '../../common/constrants'

type SearchInputProps = {
  loading?: boolean
  containerStyle?: ViewStyle
  inputStyle?: ViewStyle
} & InputProps
export const SearchInput = memo<SearchInputProps>(props => {
  const { name, value, containerStyle, inputStyle, loading, onChange, ...rest } = props

  const cStyle = useMemo(() => [styles.container, containerStyle], [containerStyle])
  const iStyle = useMemo(() => [styles.input, inputStyle], [inputStyle])
  const onClear = useCallback(() => onChange(name, ''), [name, onChange])

  return (
    <View style={cStyle}>
      <VectorImage style={styles.icon} source={SearchIcon} height={24} width={24} />
      <Input
        style={iStyle}
        name={name}
        value={value}
        placeholder="Search"
        onChange={onChange}
        autoCapitalize="none"
        {...rest}
      />
      {!!loading && <ActivityIndicator style={styles.loader} size={24} />}
      {!!value && (
        <TouchableOpacity style={styles.xBtn} onPress={onClear}>
          <VectorImage style={styles.xIcon} source={XIcon} height={X_BUTTON_SIZE} width={X_BUTTON_SIZE} />
        </TouchableOpacity>
      )}
    </View>
  )
})

const SearchIcon = require('../../../assets/images/search.icon.svg')
const XIcon = require('../../../assets/images/x.icon.svg')

const X_BUTTON_SIZE = 24

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },

  icon: {
    position: 'absolute',
    left: 0,
    bottom: 14,
    tintColor: colors.textSecondary,
    width: 24,
    height: 24,
  },
  input: {
    ...fonts.h4Regular,
    paddingStart: 30,
    paddingEnd: 30,
  },

  xBtn: { position: 'absolute', right: 0, bottom: 10 },
  xIcon: {
    tintColor: colors.textSecondary,
    width: X_BUTTON_SIZE,
    height: X_BUTTON_SIZE,
  },

  loader: {
    position: 'absolute',
    right: X_BUTTON_SIZE + 5,
    bottom: 10,
  },
})
