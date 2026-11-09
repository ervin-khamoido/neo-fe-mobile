import React, { useCallback } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../ioc'
import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typefaceV2'

import { Button } from '../../component/button-v2'
import { Input } from '../../component/form/input-v2'

import { EmailBLoC } from './email.bloc'
import { Field } from '../../component/form/field'
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context'
import { Spacer } from '../../component/spacer'
import { LinkButton } from '../../component/button'

export const EmailScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  animationEnabled: false,
}

export const EmailScreen = observer(props => {
  const bloc = ioc.useBLoC(EmailBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  const onFireLogout = useCallback(() => bloc.onFireLogout(), [bloc])

  return (
    <SafeAreaView style={styles.wrapper} edges={Edges}>
      <KeyboardAvoidingView
        style={styles.avoidContainer}
        enabled={Platform.OS === 'ios'}
        behavior={'padding'}
        keyboardVerticalOffset={sizes.headerHeightV2 + initialWindowMetrics.insets.top}
      >
        <Spacer height={44} />
        <Text style={styles.title}>Enter your email</Text>
        <Spacer height={24} />

        <Field error={bloc.error.email}>
          <Input
            name="email"
            keyboardType={'email-address'}
            textContentType={'emailAddress'}
            autoComplete={'email'}
            value={bloc.data.email}
            onChange={onChange}
            autoCapitalize="none"
            placeholder="Email Address"
          />
        </Field>

        <Spacer height={-1} />

        <LinkButton title="Edit Phone" onPress={onFireLogout} />
        <Spacer height={24} />

        <Button
          title={'Next'}
          onPress={onSubmit}
          disabled={!bloc.data.email.length || bloc.loading}
          loading={bloc.loading}
        />
        <Spacer height={24} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  avoidContainer: {
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: 'column',
  },
  title: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
})
