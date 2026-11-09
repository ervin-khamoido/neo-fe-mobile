import React, { useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../../ioc'
import { FormFieldName } from '../../../../lib/utils/form'
import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer } from '../../../../component/spacer'
import { Input } from '../../../../component/form/input-v2'
import { Button } from '../../../../component/button-v2'
import { Field } from '../../../../component/form/field'
import { InfoConfirmationModal } from '../component/info-confirmation.modal'

import { FullNameBLoC, FullNameInput } from './full-name.bloc'

export type FullNameWidgetProps = {
  data: FullNameInput
  onChange: <T>(name: FormFieldName, value: T) => void
  onSubmit: () => any
}

export const FullNameWidget = observer<FullNameWidgetProps>(props => {
  const bloc = ioc.useBLoC(FullNameBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onFullNameConfirm = useCallback(() => bloc.onFullNameConfirm(), [bloc])
  const onModalClose = useCallback(() => bloc.onModalClose(), [bloc])

  const isNextBtnDisabled = bloc.loading || !bloc.data?.firstName.length || !bloc.data?.lastName.length

  return (
    <KeyboardAwareScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.container} edges={Edges}>
        <Text style={styles.header}>Name</Text>
        <Spacer height={24} />

        <Field error={bloc.error.firstName}>
          <Input
            name="firstName"
            autoCapitalize="words"
            autoComplete="name-given"
            autoCorrect={false}
            placeholder="First Name"
            value={bloc.data?.firstName}
            onChange={onChange}
          />
        </Field>
        <Spacer height={40} />

        <Field error={bloc.error.middleName}>
          <Input
            name="middleName"
            autoCapitalize="words"
            autoComplete="name-middle"
            autoCorrect={false}
            placeholder="Middle Name (optional)"
            value={bloc.data?.middleName}
            onChange={onChange}
          />
        </Field>
        <Spacer height={40} />

        <Field error={bloc.error.lastName}>
          <Input
            name="lastName"
            autoCapitalize="words"
            autoComplete="name-family"
            autoCorrect={false}
            placeholder="Last Name"
            value={bloc.data?.lastName}
            onChange={onChange}
          />
        </Field>
        <Spacer height={-1} />

        <Button title="Next" disabled={isNextBtnDisabled} loading={bloc.loading} onPress={onSubmit} />
        <Spacer height={24} />

        <InfoConfirmationModal
          visible={bloc.isConfirmModalVisible}
          title="Confirm your name"
          body='Please select "confirm" if the name on your government issued ID card is:'
          value={bloc.fullName}
          onConfirm={onFullNameConfirm}
          onCancel={onModalClose}
        />
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  info: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  label: {
    ...fonts.h4Regular,
    color: colors.text,
  },
})
