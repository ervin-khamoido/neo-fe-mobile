import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import ioc from '../../ioc'
import { VerifyingType } from '../../models'
import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'

import { CodeVerifyModalBLoC } from './code-verify-modal.bloc'
import { BasicModal } from '../../component/modals/basic-modal'
import LottieView from 'lottie-react-native'

export const CodeVerifyModal = observer(props => {
  const bloc = ioc.useBLoC(CodeVerifyModalBLoC, props)

  const onAnimationFinished = useCallback(() => bloc.onAnimationFinished(), [bloc])

  return (
    <BasicModal
      style={styles.container}
      isVisible={bloc.isVisible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      animationOutTiming={1}
      // hideModalContentWhileAnimating - do not include this
      // useNativeDriver - do not include this
      hardwareAccelerated
    >
      <View style={styles.iconCenter}>
        <LottieView
          style={styles.icon}
          source={FinishSignUpAnimation}
          loop={false}
          autoPlay={true}
          onAnimationFinish={onAnimationFinished}
        />
      </View>
      <Text style={styles.text}>{bloc.isVerified ? label[bloc.verifyType] : 'Verifying...'}</Text>
    </BasicModal>
  )
})

const label = {
  [VerifyingType.Phone]: 'Phone Number Verified',
  [VerifyingType.Email]: 'Email Verified',
}

const FinishSignUpAnimation = require('../../../assets/animations/done-extra-circle.json')

const styles = StyleSheet.create({
  container: {
    margin: 0,
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...fonts.h3Regular,
    color: colors.text,
  },
  iconCenter: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginBottom: 30,
    width: 232,
    height: 232,
  },
})
