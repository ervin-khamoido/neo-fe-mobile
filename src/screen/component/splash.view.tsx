import React, { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { colors } from '../../common/constrants'

const LaunchScreenSrc = require('../../../assets/images/launch_screen_img.png')

export const SplashView = memo(() => (
  <View style={styles.container}>
    <Image style={styles.splash} resizeMode="cover" source={LaunchScreenSrc} />
  </View>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  splash: {
    width: '100%',
    height: '100%',
  },
})
