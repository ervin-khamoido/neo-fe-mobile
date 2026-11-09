import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Observer, observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../../ioc'
import { FullNameWidget } from '../../../auth/sign-up-details/widget/full-name.widget'

import { LevelOneFullNameBLoC } from './level-one-full-name.bloc'

export const LevelOneFullNameScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

export const LevelOneFullNameScreen = observer(props => {
  const bloc = ioc.useBLoC(LevelOneFullNameBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return <FullNameWidget data={bloc.data} onChange={onChange} onSubmit={onSubmit} />
})

const styles = StyleSheet.create({})
