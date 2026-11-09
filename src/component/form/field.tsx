import React, { memo, PropsWithChildren, useMemo } from 'react'
import { StyleSheet, View, Text, ViewProps } from 'react-native'

import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'

type FieldProps = {
  error?: string
} & ViewProps
export const Field = memo((props: PropsWithChildren<FieldProps>) => {
  const { children, error, style, ...rest } = props

  const containerStyle = useMemo(() => StyleSheet.flatten([styles.container, style]), [style])

  return (
    <View {...rest} style={containerStyle}>
      {children}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  error: {
    ...fonts.h5Regular,
    color: colors.danger,
    marginTop: 3,
  },
})
