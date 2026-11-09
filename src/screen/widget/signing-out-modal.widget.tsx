import React, { memo, useCallback } from 'react'
import { Text, StyleSheet } from 'react-native'
import { Observer } from 'mobx-react-lite'

import { fonts } from '../../common/typeface'
import { colors } from '../../common/constrants'
import LottieView from 'lottie-react-native'
import ioc from '../../ioc'

import { SigningOutModalBLoC } from './signing-out-modal.bloc'
import { BasicModal } from '../../component/modals/basic-modal'

const FinishSignUpAnimation = require('../../../assets/animations/done-extra-circle.json')

export const SigningOutModal = memo(props => {
  const bloc = ioc.useBLoC(SigningOutModalBLoC, props)

  const onAnimationFinished = useCallback(() => bloc.onAnimationFinished(), [bloc])

  return (
    <Observer>
      {() => (
        <BasicModal
          style={styles.container}
          isVisible={bloc.isVisible}
          animationIn={'fadeIn'}
          animationInTiming={1}
          animationOut={'fadeOut'}
        >
          <LottieView
            style={styles.icon}
            source={FinishSignUpAnimation}
            loop={false}
            autoPlay={true}
            onAnimationFinish={onAnimationFinished}
          />
          <Text style={styles.note}>Logging out...</Text>
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
  icon: {
    marginBottom: 30,
    width: 232,
    height: 232,
  },
  note: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
})
