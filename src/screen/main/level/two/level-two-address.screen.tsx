import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../../ioc'

import { AddressWidget } from '../../../auth/sign-up-details/widget/address.widget'

import { LevelTwoAddressBLoC } from './level-two-address.bloc'

export const LevelTwoAddressScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

export const LevelTwoAddressScreen = observer(props => {
  const bloc = ioc.useBLoC(LevelTwoAddressBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return <AddressWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})
