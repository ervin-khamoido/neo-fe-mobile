import React, { memo, useMemo } from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../common/constrants'

import * as helpers from '../lib/utils/helpers'

type ProgressProps = {
  progress: number // 0-1
} & ViewStyle
export const Progress = memo<ProgressProps>(({ progress, ...rest }) => {
  progress = helpers.clamp(progress, 0, 1)

  const progressStyle = useMemo(() => ({ ...styles.progress, flex: progress }), [progress])
  const remainingStyle = useMemo(() => ({ ...styles.remaining, flex: 1 - progress }), [progress])

  return (
    <View {...rest} style={styles.container}>
      <View style={progressStyle} />
      <View style={remainingStyle} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
    height: 3,
  },
  remaining: {
    backgroundColor: colors.border,
    height: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  progress: {
    backgroundColor: colors.primary,
    height: 3,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
  },
})
