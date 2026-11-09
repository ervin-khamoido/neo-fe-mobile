import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../ioc'
import { sizes } from '../../common/constrants'

import { Field } from '../../component/form/field'
import { Input } from '../../component/form/input'

import { InviteBLoC } from './invite.bloc'
import { Button } from '../../component/button'

export const InviteScreenOptions: StackNavigationOptions = {
  headerShown: false,
  presentation: 'modal',
  title: 'Invite user',
  headerBackTitle: 'Must not be shown!',
}

export const InviteScreen = memo(props => {
  const bloc = ioc.useBLoC(InviteBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <Text style={styles.title}>Invite Friend</Text>

          <Field error={bloc.errors.phone || bloc.errors.email}>
            <Input
              name="emailOrPhone"
              keyboardType={bloc.data.email !== null ? 'email-address' : 'phone-pad'}
              textContentType={bloc.data.email !== null ? 'emailAddress' : 'telephoneNumber'}
              autoComplete={bloc.data.email !== null ? 'email' : 'tel'}
              value={bloc.data.email || bloc.data.phone}
              onChange={onChange}
              autoCapitalize="none"
              placeholder="Email address or phone number..."
            />
          </Field>

          <View style={styles.spacer} />

          <Button title={'Invite'} onPress={onSubmit} />
        </SafeAreaView>
      )}
    </Observer>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.margin,
  },
  spacer: {
    flex: 1,
  },

  title: {
    // ...fonts.bigTitle,
    marginVertical: 1.5 * sizes.gutter,
  },
})
