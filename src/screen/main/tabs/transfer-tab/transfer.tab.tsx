import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../../ioc'

import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { SendAmountScreen, SendAmountScreenOptions } from '../../send-money/send-amount.screen'
import { ReceiveAddressScreen, ReceiveAddressScreenOptions } from '../../receive-money/receive-address.screen'

import { TransferBLoC } from './transfer.bloc'

const Tab = createMaterialTopTabNavigator()
const DollarIconSrc = require('../../../../../assets/images/dollar-sign.icon.svg')

const CommonScreenOptions: MaterialTopTabNavigationOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.text,
  tabBarIndicatorStyle: {
    height: 4,
    backgroundColor: colors.accent,
  },
  tabBarLabelStyle: {
    ...fonts.h3Regular,
    textTransform: 'none',
  },
  tabBarIconStyle: {
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
  },
  tabBarItemStyle: {
    paddingVertical: 16,
  },
}

export const TransactionTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color }) => <VectorImage style={{ tintColor: color }} width={24} height={24} source={DollarIconSrc} />,
  tabBarLabel: 'Money',
  headerShown: false,
}

export const TransferTab = observer(props => {
  const bloc = ioc.useBLoC(TransferBLoC, props)

  const screenListeners = useCallback(
    ({ route }) => ({
      state: () => bloc.trackBreadcrumb(route.name),
    }),
    [bloc],
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Tab.Navigator screenOptions={CommonScreenOptions} screenListeners={screenListeners}>
        <Tab.Screen options={SendAmountScreenOptions} name="Send" component={SendAmountScreen} />
        <Tab.Screen options={ReceiveAddressScreenOptions} name="Receive" component={ReceiveAddressScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  )
})

const Edges = ['top'] as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
})
