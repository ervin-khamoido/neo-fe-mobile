import React, { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { CircleSnail } from 'react-native-progress'
import { colors } from '../common/colorV2'

type CircleActivityIndicatorProps = {
  size: number
  color?: string
  thickness?: number
}
export const CircleActivityIndicator = memo<CircleActivityIndicatorProps>(({ size, color, thickness = 10 }) => {
  const containerStyle = useMemo(() => [styles.container, { width: size, height: size }], [size])

  return (
    <View style={containerStyle}>
      <CircleSnail size={size} thickness={thickness} color={color ?? colors.primary} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
})
