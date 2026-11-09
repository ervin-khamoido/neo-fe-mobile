import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'

import { Spacer } from '../../../component/spacer'
import { fonts } from '../../../common/typeface'

import { SecurityBLoC } from './security.bloc'
import { SwitchInput } from '../../../component/form/switch-input'

export const SecurityScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const SecurityScreen = observer(props => {
  const bloc = ioc.useBLoC(SecurityBLoC, props)

  // const onAppLock = useCallback((_, value) => bloc.onAppLock(value), [bloc])
  const onSecurePin = useCallback(() => bloc.onSecurePin(), [bloc])
  const onBiometrics = useCallback(() => bloc.onBiometrics(), [bloc])

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Security</Text>
      <Spacer height={14} />

      {/*<View style={styles.graySeparator} />*/}
      {/*<View style={styles.optionContainer}>*/}
      {/*  <View style={styles.iconOptionContainer}>*/}
      {/*    <VectorImage style={styles.icon} width={32} height={32} source={LockIconSrc} />*/}
      {/*    <Text style={styles.optionsText}>App Lock</Text>*/}
      {/*  </View>*/}
      {/*  <SwitchInput name="appLock" value={bloc.isAppLockEnabled} onChange={onAppLock} />*/}
      {/*</View>*/}
      <View style={styles.graySeparator} />

      {bloc.isAppLockEnabled && bloc.isBiometricsAvailable && Platform.OS === 'ios' && (
        <>
          <View style={styles.optionContainer}>
            <View style={styles.iconOptionContainer}>
              <VectorImage style={styles.icon} width={32} height={32} source={FingerPrintIcon} />
              <Text style={styles.optionsText}>Use Biometrics</Text>
            </View>
            <SwitchInput
              name="biometrics"
              value={bloc.isBiometricsEnabled}
              disabled={bloc.biometricLoading}
              onChange={onBiometrics}
            />
          </View>
          <View style={styles.graySeparator} />
        </>
      )}

      {bloc.isAppLockEnabled && (
        <>
          <TouchableOpacity style={styles.optionContainer} onPress={onSecurePin}>
            <View style={styles.iconOptionContainer}>
              <VectorImage style={styles.icon} width={32} height={32} source={KeyIconSrc} />
              <Text style={styles.optionsText}>Change Secure PIN</Text>
            </View>
            <VectorImage style={styles.chevronRightIcon} width={20} height={20} source={ChevronRightIconSrc} />
          </TouchableOpacity>
          <View style={styles.graySeparator} />
        </>
      )}

      <Spacer height={-1} />
    </SafeAreaView>
  )
})

const ChevronRightIconSrc = require('../../../../assets/images/chevron-right.icon.svg')
const FingerPrintIcon = require('../../../../assets/images/fingerprint.icon.svg')
const KeyIconSrc = require('../../../../assets/images/key.icon.svg')

const styles = StyleSheet.create({
  tabIcon: {
    tintColor: colors.text,
  },
  activeTabIcon: {
    tintColor: colors.primary,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 26,
  },
  iconOptionContainer: {
    flexDirection: 'row',
  },
  title: {
    ...fonts.h1Regular,
    lineHeight: 32,
    color: colors.text,
  },
  optionsText: {
    ...fonts.h3Regular,
    color: colors.text,
    marginHorizontal: 18,
  },
  icon: {
    tintColor: colors.border,
    width: 32,
    height: 32,
  },
  graySeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray4,
  },
  chevronRightIcon: {
    width: 20,
    height: 20,
  },
})
