import React, { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../../ioc'

import { LevelOneBankAccountBLoC } from './level-one-bank-account.bloc'
import { BankAccountWidget } from '../../../bank/widget/bank-account.widget'
import { BankAccountWidgetMode } from '../../../common'

export const LevelOneBankAccountScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

export const LevelOneBankAccountScreen = observer(props => {
  const bloc = ioc.useBLoC(LevelOneBankAccountBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onCancel = useCallback(() => {}, [])

  return (
    <BankAccountWidget
      mode={BankAccountWidgetMode.LevelOne}
      ctaBtnTitle="Next"
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  )
})

const styles = StyleSheet.create({})
