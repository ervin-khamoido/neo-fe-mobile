import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { BottomModal } from '../../../../component/modals/bottom-modal'
import { Button, OutlineButton } from '../../../../component/button-v2'
import { Spacer, VSpacer } from '../../../../component/spacer'

import { fonts } from '../../../../common/typefaceV2'
import { colors } from '../../../../common/colorV2'

type InfoConfirmationModalProps = {
  visible: boolean

  title: string
  body: string
  value: string

  onCancel: () => void
  onConfirm: () => void
}
export const InfoConfirmationModal = memo<InfoConfirmationModalProps>(props => {
  const { visible, title, body, value, onConfirm, onCancel } = props

  return (
    <BottomModal visible={visible} swipeable={true} onBackdropPress={onCancel} onSwipeDown={onCancel}>
      <Text style={styles.header}>{title}</Text>
      <Spacer height={24} />

      <Text style={styles.body}>{body}</Text>
      <Spacer height={8} />

      <Text style={styles.fullName}>{value}</Text>
      <Spacer height={24} />

      <View style={styles.buttons}>
        <OutlineButton style={styles.button} title="Cancel" onPress={onCancel} />
        <VSpacer width={17} />
        <Button style={styles.button} title="Confirm" onPress={onConfirm} />
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
  fullName: {
    ...fonts.h1Regular,
    color: colors.accent,
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
