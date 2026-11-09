import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { AuthUsernameBLoC } from './auth-username.bloc'
import { UsernameWidget } from './widget/username.widget'

export const AuthUsernameScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const AuthUsernameScreen = observer(props => {
  const bloc = ioc.useBLoC(AuthUsernameBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])

  return <UsernameWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})
