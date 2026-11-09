import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton } from '../../../component/button'
import { BottomModal } from '../../../component/modals/bottom-modal'
import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'

type ResetPINModalProps = {
  visible: boolean
  email: string
  loading: boolean

  onCancel: () => void
  onReset: () => void
  onModalHide?: () => void
}
export const ResetPINModal = memo<ResetPINModalProps>(props => {
  const { visible, email, loading, onCancel, onReset, onModalHide } = props

  return (
    <BottomModal
      modalMutexGroup="Pin"
      swipeable={true}
      visible={visible}
      onSwipeDown={loading ? undefined : onCancel}
      onBackdropPress={loading ? undefined : onCancel}
      onModalHide={onModalHide}
    >
      <Spacer height={6} />
      <Text style={styles.title}>Are you sure you want to reset your PIN?</Text>
      <Spacer height={16} />

      <Text style={styles.body}>By continuing, an email with the new PIN will be sent to {email}</Text>
      <Spacer height={81} />

      <View style={styles.buttons}>
        <OutlineButton style={styles.btn} title="No" disabled={loading} onPress={onCancel} />
        <VSpacer width={20} />
        <Button style={styles.btn} title="Yes, Reset" disabled={loading} loading={loading} onPress={onReset} />
      </View>

      <Spacer height={34} />
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  title: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  body: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },

  buttons: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
  },
})
