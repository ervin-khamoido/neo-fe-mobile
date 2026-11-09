import React, { memo } from 'react'
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native'
import { colors } from '../../common/constrants'

export const LoadingView = memo(() => (
  <View style={styles.container}>
    <StatusBar backgroundColor={colors.primary} barStyle="light-content" />
    <ActivityIndicator style={styles.indicator} color={colors.textLight} size={50} />
  </View>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  indicator: {
    marginBottom: 50,
  },
})
