import React, { memo } from 'react'
import _ from 'lodash'
import { StyleSheet, View } from 'react-native'

import { colors } from '../../../../common/constrants'

export type BulletsInputProps = {
  length: number
  error: string
}
export const BulletsInput = memo<BulletsInputProps>(({ length, error }) => (
  <View style={[styles.bullets, error ? styles.bulletsUnderlineErrorColor : styles.bulletsUnderlineColor]}>
    {_.range(length).map(x => (
      <View key={x} style={styles.bullet} />
    ))}
  </View>
))

const styles = StyleSheet.create({
  bullets: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderBottomWidth: 1,
    height: 68,
    maxWidth: 243,
    width: '100%',
  },
  bulletsUnderlineColor: {
    borderBottomColor: colors.borderLight2,
  },
  bulletsUnderlineErrorColor: {
    borderBottomColor: colors.danger,
  },
  bullet: {
    borderRadius: 15,
    height: 27,
    width: 27,
    backgroundColor: colors.text,
    marginHorizontal: 16,
  },
})
