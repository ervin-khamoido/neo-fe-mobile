import React from 'react'
import { observer } from 'mobx-react-lite'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { SignUpNavigatorDef } from '../../common'

import { ReferrerScreen, ReferrerScreenOptions } from './referrer.screen'
import { AuthFullNameScreen, AuthFullNameScreenOptions } from './auth-full-name.screen'
import { AuthDoBScreen, AuthDoBScreenOptions } from './auth-dob.screen'
import { AuthUsernameScreen, AuthUsernameScreenOptions } from './auth-username.screen'

import { SignUpDetailsBLoC } from './sign-up-details.bloc'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'
import { AuthAddressScreen, AuthAddressScreenOptions } from './auth-address.screen'

export const SignUpDetailsScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

const SignUpDetailsStack = createStackNavigator<SignUpNavigatorDef>()

export const SignUpDetailsNavigator = observer(props => {
  const bloc = ioc.useBLoC(SignUpDetailsBLoC, props)

  return (
    <SignUpDetailsStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName="AuthFullName">
      <SignUpDetailsStack.Screen
        name={'AuthFullName'}
        options={AuthFullNameScreenOptions}
        component={AuthFullNameScreen}
      />
      <SignUpDetailsStack.Screen name={'AuthDoB'} options={AuthDoBScreenOptions} component={AuthDoBScreen} />
      <SignUpDetailsStack.Screen
        name={'AuthAddress'}
        options={AuthAddressScreenOptions}
        component={AuthAddressScreen}
      />
      <SignUpDetailsStack.Screen name={'Referrer'} options={ReferrerScreenOptions} component={ReferrerScreen} />
      <SignUpDetailsStack.Screen
        name={'AuthUsername'}
        options={AuthUsernameScreenOptions}
        component={AuthUsernameScreen}
      />
    </SignUpDetailsStack.Navigator>
  )
})
