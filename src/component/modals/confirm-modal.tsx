import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { BottomModal } from './bottom-modal'
import { Button, OutlineButton } from '../button-v2'
import { Spacer, VSpacer } from '../spacer'

import { fonts } from '../../common/typeface'
import { colors } from '../../common/constrants'

interface IConfirmModalProps {
  visible: boolean

  title: string
  body?: string
  confirmButtonText?: string
  cancelButtonText?: string

  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmModal = observer<IConfirmModalProps>(props => {
  const {
    visible,
    title,
    body,
    onConfirm,
    onCancel,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
  } = props

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
        <OutlineButton style={styles.button} title={cancelButtonText} onPress={onCancel} />
        <VSpacer width={16} />
        <Button style={styles.button} title={confirmButtonText} onPress={onConfirm} />
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
