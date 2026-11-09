import React, { useCallback } from 'react'
import { StackNavigationOptions } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, Text, View } from 'react-native'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { LotteryWinnerBLoC, LotteryWinnerState } from './lottery-winner.bloc'
import LottieView from 'lottie-react-native'
import { fonts } from '../../../common/typefaceV2'
import { Spacer } from '../../../component/spacer'
import { Button } from '../../../component/button-v2'

export const LotteryWinnerScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
}

export const LotteryWinnerScreen = observer(props => {
  const bloc = ioc.useBLoC(LotteryWinnerBLoC, props)

  const onAnimationFinished = useCallback(() => bloc.onAnimationFinish(), [bloc])
  const onBack = useCallback(() => bloc.onBack(), [bloc])

  const renderCountDown = () => (
    <LottieView
      style={styles.countDown}
      source={CountDownSrc}
      autoPlay
      loop={false}
      onAnimationFinish={onAnimationFinished}
    />
  )

  const renderLotteryWinner = () => (
    <>
      <Spacer height={76} />

      <Text style={styles.celebrateIcon}>🎉</Text>
      <Spacer height={8} />

      <Text style={styles.title}>Congratulations!</Text>
      <Spacer height={12} />

      <Text style={styles.text}>You won</Text>
      <Spacer height={24} />

      <View style={styles.box}>
        <Text style={styles.winAmount}>{bloc.displayAmount}</Text>
        <Text style={styles.winLabel}>Added to your wallet</Text>
      </View>
      <Spacer height={12} />

      <Text style={styles.winDate}>{bloc.displayDrawAt}</Text>
      <Spacer height={-1} />

      <Button style={styles.ctaBtn} textStyle={styles.ctaBtnTxt} title="Go to Wallet" onPress={onBack} />
    </>
  )

  const renderLotteryLoser = () => (
    <>
      <Spacer height={76} />

      <Text style={styles.celebrateIcon}>🍀</Text>
      <Spacer height={8} />

      <Text style={styles.title}>No Luck This Time</Text>
      <Spacer height={12} />

      <Text style={styles.text}>Keep your locks active to stand a chance to win next Saturday!</Text>
      <Spacer height={-1} />

      <Button style={styles.ctaBtn} textStyle={styles.ctaBtnTxt} title="Go to Wallet" onPress={onBack} />
    </>
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      {bloc.state === LotteryWinnerState.CountDown && renderCountDown()}
      {bloc.state === LotteryWinnerState.Winner && renderLotteryWinner()}
      {bloc.state === LotteryWinnerState.Loser && renderLotteryLoser()}
    </SafeAreaView>
  )
})

const CountDownSrc = require('../../../../assets/animations/count_down_animation.json')

const Edges: Edge[] = ['top', 'bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  countDown: {
    flex: 1,
    alignSelf: 'stretch',
  },

  celebrateIcon: {
    fontSize: 80,
  },

  title: {
    ...fonts.h1Bold,
    color: colors.textLight,
  },
  text: {
    ...fonts.h3Regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  box: {
    shadowColor: '#000000',
    shadowOpacity: 0.0256,
    shadowRadius: 20,
    shadowOffset: {
      height: 0,
      width: 0,
    },
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  winAmount: {
    ...fonts.numbersM,
    color: colors.text,
  },
  winLabel: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  winDate: {
    ...fonts.h4SemiBold,
    color: colors.textLight,
    opacity: 0.6,
  },

  ctaBtn: {
    alignSelf: 'stretch',
    backgroundColor: colors.background,
  },
  ctaBtnTxt: {
    color: colors.accent,
  },
})
