import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { DoBWidget } from './widget/dob.widget'
import { AuthDoBBLoC } from './auth-dob.bloc'

export const AuthDoBScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const AuthDoBScreen = observer(props => {
  const bloc = ioc.useBLoC(AuthDoBBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])

  return <DoBWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})
