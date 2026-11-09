import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { BottomModal } from '../../../component/modals/bottom-modal'
import { OutlineButton, Button } from '../../../component/button-v2'
import { Spacer, VSpacer } from '../../../component/spacer'

import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'

interface IConfirmModalProps {
  visible: boolean

  title: string
  body?: string

  onCancel: () => void
  onConfirm: () => void
}
export const ConfirmModal = memo<IConfirmModalProps>(({ visible, title, body, onConfirm, onCancel }) => {
  return (
    <BottomModal visible={visible} swipeable={true} onBackdropPress={onCancel} onSwipeDown={onCancel}>
      <Text style={styles.header}>{title}</Text>
      <Spacer height={24} />

      {!!body && (
        <>
          <Text style={styles.body}>{body}</Text>
          <Spacer height={24} />
        </>
      )}

      <View style={styles.buttons}>
        <Button style={styles.button} title="Yes" onPress={onConfirm} />
        <VSpacer width={16} />
        <OutlineButton style={styles.button} title="No" onPress={onCancel} />
      </View>
      <Spacer height={20} />
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  header: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...fonts.h4Regular,
    color: colors.text,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
})
