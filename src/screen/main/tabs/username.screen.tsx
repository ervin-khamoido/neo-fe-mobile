import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { UsernameBLoC } from './username.bloc'
import { UsernameWidget } from '../../auth/sign-up-details/widget/username.widget'

export const UsernameScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  animationEnabled: true,
}

export const UsernameScreen = observer(props => {
  const bloc = ioc.useBLoC(UsernameBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(value), [bloc])

  return <UsernameWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})
