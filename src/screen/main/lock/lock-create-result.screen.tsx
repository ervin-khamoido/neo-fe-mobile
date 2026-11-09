import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import LottieView from 'lottie-react-native'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { LockCreateResultBloc } from './lock-create-result.bloc'
import { Button } from '../../../component/button-v2'
import { Spacer } from '../../../component/spacer'
import { sizes } from '../../../common/constrants'
import { LockAmountMode } from '../../../models'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

export const LockCreateResultScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
}
export const LockCreateResultScreen = observer(props => {
  const bloc = ioc.useBLoC(LockCreateResultBloc, props)

  const onAnimationFinished = useCallback(() => bloc.onAnimationFinished(), [bloc])
  const onClose = useCallback(() => bloc.onClose(), [bloc])

  const labelText = {
    [LockAmountMode.Create]: (
      <Text style={styles.text}>
        You’ve successfully created <Text style={styles.accentText}>{bloc.lock?.name ?? 'Dream Lock'}</Text> and
        deposited <Text style={styles.accentText}>{bloc.amount}</Text> until{' '}
        <Text style={styles.accentText}>{bloc.formattedLockUntilDate}</Text>
      </Text>
    ),
    [LockAmountMode.Deposit]: (
      <Text style={styles.text}>
        You’ve successfully added <Text style={styles.accentText}>{bloc.amount}</Text> to your{' '}
        <Text style={styles.accentText}>{bloc.lock?.name ?? 'Dream Lock'}</Text>
      </Text>
    ),
    [LockAmountMode.Withdraw]: (
      <Text style={styles.text}>
        You’ve successfully withdrawn <Text style={styles.accentText}>{bloc.withdrawalAmount}</Text> to your account
      </Text>
    ),
  }

  const secondaryLabelText = {
    [LockAmountMode.Create]: <Text style={styles.textLabel}>Adding...</Text>,
    [LockAmountMode.Deposit]: <Text style={styles.textLabel}>Adding...</Text>,
    [LockAmountMode.Withdraw]: <Text style={styles.textLabel}>Withdrawing...</Text>,
  }

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <View style={styles.wrapper}>
        <Spacer height={136} />
        <View style={styles.column}>
          <LottieView
            style={styles.icon}
            source={FinishSignUpAnimation}
            loop={false}
            autoPlay={true}
            onAnimationFinish={onAnimationFinished}
          />

          {bloc.isAnimationFinished ? labelText[bloc.mode] : secondaryLabelText[bloc.mode]}
        </View>

        {bloc.isAnimationFinished && (
          <Button
            style={styles.btn}
            title="Close"
            loading={bloc.loading}
            disabled={bloc.loading}
            onPress={onClose}
            indicatorColor={colors.accent}
          />
        )}
        <Spacer height={24} />
      </View>
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const FinishSignUpAnimation = require('../../../../assets/animations/done-extra-circle.json')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  textLabel: {
    textAlign: 'center',
    ...fonts.h2Regular,
    color: colors.textSecondary2,
  },
  accentText: {
    ...fonts.h1Bold,
    color: colors.accent,
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  btn: {
    width: '100%',
    position: 'absolute',
    bottom: 24,
  },
  icon: {
    width: 160,
    height: 160,
  },
})
