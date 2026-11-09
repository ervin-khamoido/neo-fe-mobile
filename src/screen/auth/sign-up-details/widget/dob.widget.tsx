import React, { useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../../ioc'
import { colors, sizes } from '../../../../common/constrants'
import { fonts } from '../../../../common/typeface'

import { Spacer } from '../../../../component/spacer'
import { DateInput } from '../../../../component/form/input-v2'
import { Button } from '../../../../component/button-v2'

import { Field } from '../../../../component/form/field'
import { FormFieldName } from '../../../../lib/utils/form'
import { InfoConfirmationModal } from '../component/info-confirmation.modal'

import { DoBBLoC, DoBInput } from './dob.bloc'

export type DoBWidgetProps = {
  data: DoBInput
  onChange: <T>(name: FormFieldName, value: T) => void
  onSubmit: () => unknown
}

export const DoBWidget = observer<DoBWidgetProps>(props => {
  const bloc = ioc.useBLoC(DoBBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onDoBConfirm = useCallback(() => bloc.onDoBConfirm(), [bloc])
  const onModalClose = useCallback(() => bloc.onModalClose(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.header}>Date of birth</Text>
      <Spacer height={14} />

      <Text style={styles.info}>
        Enter your date of birth as it appears on your government-issued identity card. You have to be at least 18 years
        old to register
      </Text>
      <Spacer height={40} />

      <Field error={bloc.error.dateOfBirth}>
        <DateInput
          name="dateOfBirth"
          value={bloc.data?.dateOfBirth}
          defaultPickerValue={bloc.defaultPickerDate}
          maxDate={bloc.maxDate}
          onChange={onChange}
        />
      </Field>
      <Spacer height={-1} />

      <Button title="Next" onPress={onSubmit} disabled={!bloc.data?.dateOfBirth} />
      <Spacer height={24} />

      <InfoConfirmationModal
        visible={bloc.isConfirmModalVisible}
        title="Confirm Date of Birth"
        body="Please select Confirm if the date of birth on your government-issued ID card is"
        value={bloc.dateOfBirthFormatted}
        onConfirm={onDoBConfirm}
        onCancel={onModalClose}
      />
    </SafeAreaView>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
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
