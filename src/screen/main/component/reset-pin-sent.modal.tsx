import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'

import { Spacer } from '../../../component/spacer'
import { Button } from '../../../component/button'
import { BottomModal } from '../../../component/modals/bottom-modal'
import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'

type ResetPINSentModalProps = {
  visible: boolean
  email: string

  onClose: () => void
}
export const ResetPINSentModal = memo<ResetPINSentModalProps>(props => {
  const { visible, email, onClose } = props

  return (
    <BottomModal modalMutexGroup="Pin" swipeable={false} visible={visible}>
      <Spacer height={22} />
      <Text style={styles.title}>New PIN is sent on Mail</Text>
      <Spacer height={16} />

      <Text style={styles.body}>A new PIN has been sent to {email} please do not share it with anyone.</Text>
      <Spacer height={69} />

      <Button style={styles.btn} title="Okay" onPress={onClose} />

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

  btn: {
    // width:
  },
})
