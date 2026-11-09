import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../ioc'

import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { Button } from '../../component/button-v2'

import { Spacer, VSpacer } from '../../component/spacer'
import { fonts } from '../../common/typefaceV2'
import { RegisterOrSignInBLoC } from './register-or-signin.bloc'
import VectorImage from 'react-native-vector-image'

export const RegisterOrSignInScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const RegisterOrSignInScreen = observer(props => {
  const bloc = ioc.useBLoC(RegisterOrSignInBLoC, props)

  const onRegister = useCallback(() => bloc.onRegister(), [bloc])
  const onSignIn = useCallback(() => bloc.onSignIn(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Spacer height={160} />

      <VectorImage width={222} height={40} source={NeobankLogoIconAndWord} />
      <Spacer height={12} />

      <Text style={styles.label}>The digital dollar wallet, that lets you send, spend, and save.</Text>

      <Spacer height={-1} />

      <View style={styles.buttons}>
        <Button style={styles.button} title={'Sign In'} onPress={onSignIn} />
        <VSpacer width={16} />
        <Button style={styles.button} title={'Register'} onPress={onRegister} />
      </View>

      <Spacer height={24} />
    </SafeAreaView>
  )
})

const NeobankLogoIconAndWord = require('../../../assets/images/neobank-logo-icon-and-word.icon.svg')
const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  label: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
})
