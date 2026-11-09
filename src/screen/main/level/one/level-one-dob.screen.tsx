import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../../ioc'

import { DoBWidget } from '../../../auth/sign-up-details/widget/dob.widget'

import { LevelOneDoBBLoC } from './level-one-dob.bloc'

export const LevelOneDoBScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

export const LevelOneDoBScreen = observer(props => {
  const bloc = ioc.useBLoC(LevelOneDoBBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return <DoBWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})

const styles = StyleSheet.create({})
