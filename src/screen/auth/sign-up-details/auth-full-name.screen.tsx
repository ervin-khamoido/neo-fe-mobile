import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { FullNameWidget } from './widget/full-name.widget'
import { AuthFullNameBLoC } from './auth-full-name.bloc'

export const AuthFullNameScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const AuthFullNameScreen = observer(props => {
  const bloc = ioc.useBLoC(AuthFullNameBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])

  return <FullNameWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})
