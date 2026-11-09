import React, { memo, useCallback } from 'react'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../ioc'

import { AddBankAccount2BLoC } from './add-bank-account.bloc'
import { BankAccountWidget } from './widget/bank-account.widget'

export const AddBankAccount2ScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Bank Details',
}

export const AddBankAccount2Screen = memo(props => {
  const bloc = ioc.useBLoC(AddBankAccount2BLoC, props)

  const onSubmit = useCallback(uid => bloc.onSubmit(uid), [bloc])
  const onCancel = useCallback(() => bloc.onCancel(), [bloc])

  return (
    <Observer>
      {() => <BankAccountWidget mode={bloc.mode} ctaBtnTitle={bloc.cta} onSubmit={onSubmit} onCancel={onCancel} />}
    </Observer>
  )
})
