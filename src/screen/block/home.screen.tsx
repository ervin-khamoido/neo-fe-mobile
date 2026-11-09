import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../ioc'
import { colors, sizes } from '../../common/constrants'

import { HomeBLoC } from './home.bloc'
import { fonts } from '../../common/typeface'
import VectorImage from 'react-native-vector-image'
import { OutlineButton } from '../../component/button'
import { Spacer } from '../../component/spacer'

export const HomeScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
}

export const HomeScreen = observer(props => {
  const bloc = ioc.useBLoC(HomeBLoC, props)

  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Spacer height={-1} />
      <View style={styles.alert}>
        <VectorImage style={styles.alertIcon} width={90} height={90} source={AlertIconSrc} />
      </View>
      <Spacer height={40} />

      <Text style={styles.title}>
        We're having trouble verifying the documents you submitted for KYC and are conducting additional checks, which
        might take up to 48 hours. Thank you for your patience as we work to secure your account
      </Text>
      <Spacer height={-1} />

      <OutlineButton title=" Contact Support" onPress={onSupport} loading={bloc.loading} disabled={bloc.loading}>
        <VectorImage width={18} height={18} source={InfoIconSrc} />
      </OutlineButton>
      <Spacer height={20} />
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const InfoIconSrc = require('../../../assets/images/info.icon.svg')
const AlertIconSrc = require('../../../assets/images/alert-triangle.icon.svg')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.margin,
    backgroundColor: colors.background,
  },
  title: {
    ...fonts.h2Bold,
    textAlign: 'center',
    color: colors.text,
  },

  alert: {
    backgroundColor: colors.disabledBackground,
    alignSelf: 'center',
    padding: 40,
    borderRadius: 300,
  },
  alertIcon: {
    alignSelf: 'center',
  },
})
