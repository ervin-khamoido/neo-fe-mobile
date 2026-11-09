import { Switch, SwitchProps } from 'react-native'
import React, { memo, useCallback } from 'react'
import { colors } from '../../common/constrants'

export type SwitchInputProps = {
  name: string
  onChange: (name: string, value: boolean) => void
} & Omit<SwitchProps, 'onValueChange' | 'onChange'>
export const SwitchInput = memo<SwitchInputProps>(props => {
  const { name, onChange, ...otherProps } = props

  const onValueChange = useCallback(value => onChange(name, value), [name, onChange])

  return (
    <Switch
      {...otherProps}
      onValueChange={onValueChange}
      thumbColor={colors.textSecondaryLight}
      trackColor={TrackColor}
    />
  )
})

const TrackColor = {
  true: colors.primary,
  false: colors.primaryLight,
}
