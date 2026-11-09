import React, { memo, useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Observer } from 'mobx-react-lite'
import LottieView from 'lottie-react-native'

import ioc from '../../ioc'

import { colors } from '../../common/constrants'
import { Spacer } from '../../component/spacer'
import { fonts } from '../../common/typeface'

import { SigningUpModalBLoC } from './signing-up-modal.bloc'
import { BasicModal } from '../../component/modals/basic-modal'

const FinishSignUpAnimation = require('../../../assets/animations/done-extra-circle.json')

export const SigningUpModal = memo(props => {
  const bloc = ioc.useBLoC(SigningUpModalBLoC, props)

  const onAnimationFinished = useCallback(() => bloc.onAnimationFinished(), [bloc])

  return (
    <Observer>
      {() => (
        <BasicModal style={styles.container} isVisible={bloc.isVisible} animationIn={'fadeIn'} animationOut={'fadeOut'}>
          <Text style={styles.titleText}>Neobank</Text>

          <LottieView
            style={styles.lottie}
            source={FinishSignUpAnimation}
            loop={false}
            autoPlay={true}
            onAnimationFinish={onAnimationFinished}
          />
          <Spacer height={60} />
          <Text style={styles.matchingText}>Welcome to your Neobank wallet.</Text>
          <Text style={styles.matchingText2}>We're getting things ready for you to start saving. 💰</Text>
        </BasicModal>
      )}
    </Observer>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    margin: 0,
  },
  lottie: {
    width: 232,
    height: 232,
  },
  titleText: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.inter,
  },
  matchingText: {
    width: '80%',
    textAlign: 'center',
    color: colors.text,
    ...fonts.h3SemiBold,
  },
  matchingText2: {
    width: '80%',
    textAlign: 'center',
    color: colors.text,
    ...fonts.h3Regular,
  },
})
