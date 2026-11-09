import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Platform } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'

import { StackNavigationOptions } from '@react-navigation/stack'
import { BottomTabNavigationOptions, createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import ioc from '../../../ioc'
import { MainTabsNavigatorDef } from '../../common'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typeface'

import { WalletScreen, WalletTabOptions } from './wallet.screen'
import { CardScreen, CardTabOptions } from './card.screen'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'

import { MainTabsBLoC } from './main-tabs.bloc'
import { MoneyTabOptions, MoneyTab } from './transfer-tab/money.tab'

const MainTabsNav = createBottomTabNavigator<MainTabsNavigatorDef>()

export const MainTabsOptions: StackNavigationOptions = {
  headerShown: false,
}

export const MainTabs = observer(props => {
  const bloc = ioc.useBLoC(MainTabsBLoC, props)

  const screenListeners = useCallback(
    ({ route }) => ({
      state: () => bloc.trackBreadcrumb(route.name),
    }),
    [bloc],
  )

  return (
    <MainTabsNav.Navigator
      backBehavior={'history'}
      initialRouteName={'Wallet'}
      screenOptions={TabOptions}
      screenListeners={screenListeners}
    >
      <MainTabsNav.Screen name={'Wallet'} component={WalletScreen} options={WalletTabOptions} />
      <MainTabsNav.Screen name={'Money'} component={MoneyTab} options={MoneyTabOptions} />
      <MainTabsNav.Screen name={'Card'} component={CardScreen} options={CardTabOptions} />
    </MainTabsNav.Navigator>
  )
})

const iOSInsetBottom = Platform.OS === 'ios' ? initialWindowMetrics.insets.bottom : 0

const TabOptions: BottomTabNavigationOptions = {
  ...(DefaultScreenOptions as any),
  headerTitle: '',

  tabBarActiveTintColor: colors.borderActive2,
  tabBarInactiveTintColor: colors.tabInactive,
  tabBarLabelPosition: 'below-icon',
  tabBarAllowFontScaling: false,
  tabBarShowLabel: true,
  tabBarStyle: {
    height: 56 + iOSInsetBottom + 1, // height + bottom padding + border
    paddingTop: 10,
    shadowColor: 'transparent',
    borderTopWidth: 1,
    elevation: 0,
  },
  tabBarLabelStyle: {
    ...fonts.h6Regular,
    paddingBottom: 4,
  },
}
