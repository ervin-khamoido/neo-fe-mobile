import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../../../../common/constrants'
import { fonts } from '../../../../common/typeface'

export const EmptyList = memo(() => (
  <View style={styles.nothingContainer}>
    <View style={styles.centerNothing}>
      <Text style={styles.nothingText}>Nothing here.</Text>
    </View>
  </View>
))

const styles = StyleSheet.create({
  nothingContainer: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    alignContent: 'center',
  },
  centerNothing: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  nothingText: {
    ...fonts.h3Regular,
    color: colors.text,
  },
})
