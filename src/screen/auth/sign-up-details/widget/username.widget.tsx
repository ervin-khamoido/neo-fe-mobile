import React, { useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import Markdown from 'react-native-markdown-display'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import ioc from '../../../../ioc'
import { colors, sizes } from '../../../../common/constrants'
import { fonts } from '../../../../common/typeface'
import { FormFieldName } from '../../../../lib/utils/form'

import { Spacer } from '../../../../component/spacer'
import { Input } from '../../../../component/form/input-v2'
import { Button } from '../../../../component/button-v2'
import { Field } from '../../../../component/form/field'

import { UsernameBLoC, UsernameInput } from './username.bloc'
import { formatUsername } from '../../../../utils/helpers'

export type UsernameWidgetProps = {
  data: UsernameInput
  onChange: <T>(name: FormFieldName, value: T) => void
  onSubmit: () => unknown
}

export const UsernameWidget = observer<UsernameWidgetProps>(props => {
  const bloc = ioc.useBLoC(UsernameBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return (
    <KeyboardAwareScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Choose a {formatUsername('NeobankTag')}</Text>
      <Spacer height={8} />

      <Text style={styles.info}>This is your unique username to pay, get paid, and make purchases.</Text>
      <Spacer height={24} />

      <Markdown style={markdownStyles}>
        {`
A valid username
  - must be between 4 and 32 characters 
  - can only contain letters, numbers and non-consecutive underscores (_)`}
      </Markdown>
      <Spacer height={24} />

      <Field error={bloc.error}>
        <Input
          name="username"
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          value={bloc.data?.username}
          placeholder={formatUsername('NeobankTag')}
          onChange={onChange}
        />
      </Field>
      <Spacer height={16} />

      <Text style={styles.info}>neobank.app/{bloc.data?.username && formatUsername(bloc.data?.username)}</Text>
      <Spacer height={-1} />

      <Button title="Next" loading={bloc.loading} disabled={bloc.loading || !bloc.data?.username} onPress={onSubmit} />
      <Spacer height={24} />
    </KeyboardAwareScrollView>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  info: {
    ...fonts.h4Regular,
    color: colors.text,
  },
})
const markdownStyles = StyleSheet.create({
  // The main container
  // read docs -> https://github.com/iamacup/react-native-markdown-display/blob/master/src/lib/styles.js
  body: {
    ...fonts.h4Regular,
    color: colors.text,
  },
})
