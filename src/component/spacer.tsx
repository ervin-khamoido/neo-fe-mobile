import React, { memo, useMemo } from 'react'
import { View } from 'react-native'

type SpacerProps = {
  height: number
}
export const Spacer = memo<SpacerProps>(({ height }) => {
  const styles = useMemo(() => (height > 0 ? { height } : { flexGrow: 1 }), [height])

  return <View style={styles} />
})

type VSpacerProps = {
  width: number
}
export const VSpacer = memo<VSpacerProps>(({ width }) => {
  const styles = useMemo(() => (width > 0 ? { width } : { flexGrow: 1 }), [width])

  return <View style={styles} />
})
