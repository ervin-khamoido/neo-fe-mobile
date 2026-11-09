import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../ioc'

import { MatchingDummyBLoC } from './matching-dummy.bloc'
import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typeface'
import LottieView from 'lottie-react-native'
import { Spacer } from '../../component/spacer'

export const MatchingDummyScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

export const MatchingDummyScreen = observer(props => {
  const bloc = ioc.useBLoC(MatchingDummyBLoC, props)

  return (
    <View style={styles.container}>
      <LottieView style={styles.lottie} source={MatchingAnimation} loop={false} autoPlay={true} />
      <Spacer height={24} />
      <Text style={styles.matchingText}>Hold on, we are matching you with the best agent for your transaction.</Text>
    </View>
  )
})

const MatchingAnimation = require('../../../assets/animations/connecting_agents_successful.json')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  lottie: {
    width: '80%',
  },
  matchingText: {
    textAlign: 'center',
    color: colors.textLabel2,
    ...fonts.h2Regular,
  },
})
