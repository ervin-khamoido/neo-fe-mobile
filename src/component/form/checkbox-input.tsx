import { Pressable, StyleSheet, Text, TextStyle, View } from 'react-native'
import React, { memo, ReactNode, useCallback, useMemo } from 'react'
import { colors } from '../../common/colorV2'
import CheckBox from '@react-native-community/checkbox'
import { fonts } from '../../common/typefaceV2'

export type CheckboxInputProps = {
  name: string
  label?: ReactNode
  labelStyle?: TextStyle
  onChange: (name: string, value: boolean) => void
} & Omit<CheckBox['props'], 'onValueChange' | 'onChange'>
export const CheckboxInput = memo<CheckboxInputProps>(props => {
  const { name, label, labelStyle, value, onChange, ...otherProps } = props

  const labelStyleComb = useMemo(() => [styles.labelStyle, labelStyle], [labelStyle])
  const onValueChange = useCallback(x => onChange(name, x), [name, onChange])
  const onValueToggle = useCallback(() => onChange(name, !value), [name, value, onChange])

  return (
    <Pressable style={styles.container} onPress={onValueToggle}>
      <CheckBox
        {...otherProps}
        value={value}
        tintColor={colors.accent}
        tintColors={TrackColor}
        onCheckColor={colors.accent}
        onTintColor={colors.accent}
        onValueChange={onValueChange}
      />
      {!!label && <Text style={labelStyleComb}>{label}</Text>}
    </Pressable>
  )
})

const TrackColor = {
  true: colors.accent,
  false: colors.textSecondary,
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  },
  labelStyle: {
    ...fonts.h3Regular,
    color: colors.text,
    marginLeft: 16,
  },
})
