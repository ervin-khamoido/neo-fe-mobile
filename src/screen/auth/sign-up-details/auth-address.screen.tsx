import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { AddressWidget } from './widget/address.widget'
import { AuthAddressBLoC } from './auth-address.bloc'

export const AuthAddressScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const AuthAddressScreen = observer(props => {
  const bloc = ioc.useBLoC(AuthAddressBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onSkip = useCallback(() => bloc.onSkip(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])

  return <AddressWidget data={bloc.data?.address} onChange={onChange} onSubmit={onSubmit} onSkip={onSkip} />
})
