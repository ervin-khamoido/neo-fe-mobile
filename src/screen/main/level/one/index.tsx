import React from 'react'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'

import ioc from '../../../../ioc'
import { MainLevelOneNavigatorDef } from '../../../common'

import { DefaultScreenOptions } from '../../../app-header/screen-v2.options'
import { LevelOneFullNameScreen, LevelOneFullNameScreenOptions } from './level-one-full-name.screen'
import { LevelOneDoBScreen, LevelOneDoBScreenOptions } from './level-one-dob.screen'

import { LevelOneBLoC } from './level-one.bloc'
import { LevelOneBankAccountScreen, LevelOneBankAccountScreenOptions } from './level-one-bank-account.screen'

export const LevelOneScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
}

const MainLevelOneStack = createStackNavigator<MainLevelOneNavigatorDef>()

export const LevelOneScreen = observer(props => {
  const bloc = ioc.useBLoC(LevelOneBLoC, props)

  return (
    <MainLevelOneStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName={bloc.initialScreen}>
      <MainLevelOneStack.Screen
        name="LevelOneFullName"
        options={LevelOneFullNameScreenOptions}
        component={LevelOneFullNameScreen}
      />
      <MainLevelOneStack.Screen name="LevelOneDoB" options={LevelOneDoBScreenOptions} component={LevelOneDoBScreen} />
      <MainLevelOneStack.Screen
        name="LevelOneBankAccount"
        options={LevelOneBankAccountScreenOptions}
        component={LevelOneBankAccountScreen}
      />
    </MainLevelOneStack.Navigator>
  )
})
