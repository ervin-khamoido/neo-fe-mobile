import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs'

import { colors } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'

import { TransactionsScreen } from '../activity/transactions.screen'
import { PendingScreen } from './pending.screen'
import ioc from '../../../ioc'
import { ActivityBLoC } from './activity.bloc'
import { StackNavigationOptions } from '@react-navigation/stack'

const Tab = createMaterialTopTabNavigator()

export const ActivityTabOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: 'Activity',
}

const CommonScreenOptions: MaterialTopTabNavigationOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.text,
  tabBarIndicatorStyle: {
    backgroundColor: colors.primary,
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
}

/*const TransactionScreenOptions: MaterialTopTabNavigationOptions = {
  tabBarBadge: () => <UnreadBadgeWidget activityKey={'history'} />,
}

const PendingScreenOptions: MaterialTopTabNavigationOptions = {
  tabBarBadge: () => <UnreadBadgeWidget activityKey={'pending'} />,
}*/

export const ActivityScreen = observer(props => {
  const bloc = ioc.useBLoC(ActivityBLoC, props)

  const screenListeners = useCallback(
    ({ route }) => ({
      state: () => bloc.trackBreadcrumb(route.name),
    }),
    [bloc],
  )

  return (
    <Tab.Navigator screenOptions={CommonScreenOptions} screenListeners={screenListeners}>
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Pending" component={PendingScreen} />
    </Tab.Navigator>
  )
})
