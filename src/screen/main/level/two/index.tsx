import React, { memo } from 'react'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { Observer } from 'mobx-react-lite'

import ioc from '../../../../ioc'
import { MainLevelTwoNavigatorDef } from '../../../common'

import { DefaultScreenOptions } from '../../../app-header/screen.options'

import { LevelTwoAddressScreen, LevelTwoAddressScreenOptions } from './level-two-address.screen'

import { LevelTwoBLoC } from './level-two.bloc'

export const LevelTwoScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
}

const MainLevelTwoStack = createStackNavigator<MainLevelTwoNavigatorDef>()

export const LevelTwoScreen = memo(props => {
  const bloc = ioc.useBLoC(LevelTwoBLoC, props)

  return (
    <Observer>
      {() => (
        <MainLevelTwoStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName="LevelTwoAddress">
          <MainLevelTwoStack.Screen
            name="LevelTwoAddress"
            options={LevelTwoAddressScreenOptions}
            component={LevelTwoAddressScreen}
          />
        </MainLevelTwoStack.Navigator>
      )}
    </Observer>
  )
})
