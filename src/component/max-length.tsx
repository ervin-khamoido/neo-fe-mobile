import React, { memo, PropsWithChildren } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { fonts } from '../common/typeface'
import { colors } from '../common/constrants'

export type MaxLengthProps = PropsWithChildren<{
  currentLength: number
  maxLength: number
}>
export const MaxLength = memo<MaxLengthProps>(({ maxLength, currentLength, children }) => (
  <View style={styles.container}>
    {children}

    <Text style={styles.lengthTxt}>
      {currentLength} / {maxLength}
    </Text>
  </View>
))

const BottomSpaceSize = 20 + 5 // text line height + margin top

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: BottomSpaceSize,
  },
  lengthTxt: {
    position: 'absolute',
    bottom: -BottomSpaceSize,
    right: 7,
    ...fonts.h5Regular,
    color: colors.textSecondary,
  },
})
