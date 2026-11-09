import React from 'react'
import { observer } from 'mobx-react-lite'
import { createStackNavigator } from '@react-navigation/stack'

import { AuthNavigatorDef } from '../common'
import ioc from '../../ioc'

import { CodeScreen, CodeScreenOptions } from './code.screen'
import { PhoneScreen, PhoneScreenOptions } from './phone.screen'
import { EmailScreen, EmailScreenOptions } from './email.screen'
import { EmailCodeScreen, EmailCodeScreenOptions } from './email-code.screen'

import { AddBankAccount2Screen, AddBankAccount2ScreenOptions } from '../bank/add-bank-account.screen'
import { OnboardingScreen, OnboardingScreenOptions } from './onboarding.screen'
import { SignUpDetailsNavigator, SignUpDetailsScreenOptions } from './sign-up-details'
import { DefaultScreenOptions } from '../app-header/screen-v2.options'

import { AuthBLoC } from './auth.bloc'
import { RegisterOrSignInScreen, RegisterOrSignInScreenOptions } from './register-or-signin.screen'
import { SignInOptionsScreen, SignInOptionsScreenOptions } from './signin-options.screen'
import { SignInEmailScreen, SignInEmailScreenOptions } from './sign-in/sign-in-email.screen'
import { SignInEmailCodeScreen, SignInEmailCodeScreenOptions } from './sign-in/sign-in-email-code.screen'

const AuthStack = createStackNavigator<AuthNavigatorDef>()

export const AuthNavigator = observer(props => {
  const bloc = ioc.useBLoC(AuthBLoC, props)

  return (
    <AuthStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName={bloc.initial}>
      <AuthStack.Screen name={'Onboarding'} options={OnboardingScreenOptions} component={OnboardingScreen} />

      <AuthStack.Screen
        name={'RegisterOrSignIn'}
        options={RegisterOrSignInScreenOptions}
        component={RegisterOrSignInScreen}
      />
      <AuthStack.Screen name={'SignInOptions'} options={SignInOptionsScreenOptions} component={SignInOptionsScreen} />

      <AuthStack.Screen name={'Phone'} options={PhoneScreenOptions} component={PhoneScreen} />
      <AuthStack.Screen name={'Code'} options={CodeScreenOptions} component={CodeScreen} />

      <AuthStack.Screen name={'Email'} options={EmailScreenOptions} component={EmailScreen} />
      <AuthStack.Screen name={'EmailCode'} options={EmailCodeScreenOptions} component={EmailCodeScreen} />

      <AuthStack.Screen name={'SignInEmail'} options={SignInEmailScreenOptions} component={SignInEmailScreen} />
      <AuthStack.Screen
        name={'SignInEmailCode'}
        options={SignInEmailCodeScreenOptions}
        component={SignInEmailCodeScreen}
      />

      <AuthStack.Screen name={'AddBankAccount2'} options={AddBankAccOptions} component={AddBankAccount2Screen} />

      <AuthStack.Screen
        name={'SignUpDetails'}
        options={SignUpDetailsScreenOptions}
        component={SignUpDetailsNavigator}
      />
    </AuthStack.Navigator>
  )
})

const AddBankAccOptions = {
  ...AddBankAccount2ScreenOptions,
  headerShown: false,
}
