import React, { memo, ReactNode, useCallback, useMemo } from 'react'
import { View, StyleSheet, Text, ViewProps, TouchableHighlight } from 'react-native'
import _ from 'lodash'

import { colors } from '../common/constrants'
import VectorImage from 'react-native-vector-image'
import { fonts } from '../common/typeface'

export type NumpadButton = {
  key: string
  label: string | ReactNode
  value?: string | number
  action: 'input' | 'remove'
  disabled?: true
}

type NumpadProps = {
  leftBottomBtn?: NumpadButton
  disabled?: boolean

  onInput: <T>(name: T) => void
  onRemove: () => void
} & ViewProps
export const Numpad = memo<NumpadProps>(({ style, disabled, leftBottomBtn, onInput, onRemove, ...rest }) => {
  const containerStyle = useMemo(() => [styles.container, style], [style])

  const NumpadButtons: NumpadButton[][] = useMemo(
    () =>
      _.chunk(
        [
          { label: '1', value: 1, key: '1', action: 'input' },
          { label: '2', value: 2, key: '2', action: 'input' },
          { label: '3', value: 3, key: '3', action: 'input' },
          { label: '4', value: 4, key: '4', action: 'input' },
          { label: '5', value: 5, key: '5', action: 'input' },
          { label: '6', value: 6, key: '6', action: 'input' },
          { label: '7', value: 7, key: '7', action: 'input' },
          { label: '8', value: 8, key: '8', action: 'input' },
          { label: '9', value: 9, key: '9', action: 'input' },
          leftBottomBtn ? leftBottomBtn : { label: '.', value: '.', key: '.', action: 'input' },
          { label: '0', value: 0, key: '0', action: 'input' },
          {
            label: <VectorImage style={styles.backspaceIcon} width={6} height={12} source={BackspaceIconSrc} />,
            key: 'remove',
            action: 'remove',
          },
        ],
        3,
      ),
    [leftBottomBtn],
  )

  const renderRow = (chunk: NumpadButton[]) => (
    <View key={chunk.map(x => x.key).join('')} style={styles.row}>
      {chunk.map(x => (
        <NumpadCell {...x} disabled={disabled || x.disabled} key={x.key} onInput={onInput} onRemove={onRemove} />
      ))}
    </View>
  )

  return (
    <View {...rest} style={containerStyle}>
      {NumpadButtons.map(renderRow)}
    </View>
  )
})

type NumpadCellProps = {
  onInput: <T>(name: T) => void
  onRemove: () => void
} & NumpadButton
const NumpadCell = memo<NumpadCellProps>(({ label, value, action, disabled, onInput, onRemove }) => {
  const onPress = useCallback(() => {
    switch (action) {
      case 'input':
        onInput(value!)
        break
      case 'remove':
        onRemove()
        break
    }
  }, [action, value, onInput, onRemove])

  return (
    <TouchableHighlight
      style={styles.key}
      onPress={onPress}
      underlayColor={colors.accessoryBackground}
      disabled={disabled}
    >
      <Text style={disabled ? styles.keyTxtDisabled : styles.keyTxt}>{label}</Text>
    </TouchableHighlight>
  )
})

const BackspaceIconSrc = require('../../assets/images/backspace.icon.svg')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  key: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyTxt: {
    ...fonts.h1Regular,
    color: colors.text,
  },
  keyTxtDisabled: {
    ...fonts.h1Regular,
    color: colors.textDisabled,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  backspaceIcon: {
    width: 6,
    height: 12,
  },
})
