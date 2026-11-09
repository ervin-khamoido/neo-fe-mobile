import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import CheckBox from '@react-native-community/checkbox'

import { BottomModal } from '../../../../../component/modals/bottom-modal'
import { Button, LinkButton } from '../../../../../component/button'
import { Spacer } from '../../../../../component/spacer'

import { fonts } from '../../../../../common/typeface'
import { colors } from '../../../../../common/colorV2'
import { CheckboxInput } from '../../../../../component/form/checkbox-input'

type TermsAndConditionsModalProps = {
  visible: boolean

  onTermsAndConditions: () => void

  onCancel: () => void
  onConfirm: () => void
}

export const TermsAndConditionsModal = observer<TermsAndConditionsModalProps>(props => {
  const { visible, onTermsAndConditions, onConfirm, onCancel } = props

  const CheckBoxLabel = (
    <>
      I agree with{' '}
      <Text style={styles.labelLinkStyle} onPress={onTermsAndConditions}>
        Terms and Conditions.
      </Text>
    </>
  )

  const [isConfirmActive, setConfirmActive] = useState(false)
  const onCheckBoxChange = useCallback(
    (_, value) => {
      setConfirmActive(value)
    },
    [setConfirmActive],
  )

  return (
    <BottomModal visible={visible} swipeable={true} onBackdropPress={onCancel} onSwipeDown={onCancel}>
      <Spacer height={40} />
      <CheckboxInput
        name="termsAndConditions"
        label={CheckBoxLabel}
        onChange={onCheckBoxChange}
        value={isConfirmActive}
      />
      <Spacer height={40} />

      <Button style={styles.button} title="Confirm" disabled={!isConfirmActive} onPress={onConfirm} />
      <Spacer height={20} />
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  tAndC: {
    ...fonts.h2Regular,
    color: colors.text,
  },
  button: {},
  labelLinkStyle: {
    ...fonts.h3SemiBold,
    color: colors.accent,
  },
})
