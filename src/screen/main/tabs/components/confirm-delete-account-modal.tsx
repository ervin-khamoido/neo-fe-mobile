import React, { memo } from 'react'
import { Text, StyleSheet, View } from 'react-native'

import { BottomModal, BottomModalProps } from '../../../../component/modals/bottom-modal'
import { fonts } from '../../../../common/typeface'
import { colors } from '../../../../common/constrants'
import { Spacer, VSpacer } from '../../../../component/spacer'
import { Button, OutlineButton } from '../../../../component/button'

type ConfirmDeleteAccountModalProps = {
  loading: boolean
  onBack: () => void
  onConfirm: () => void
} & BottomModalProps
export const ConfirmDeleteAccountModal = memo<ConfirmDeleteAccountModalProps>(props => {
  const { loading, onBack, onConfirm, ...rest } = props

  return (
    <BottomModal
      {...rest}
      swipeable={true}
      onBackdropPress={loading ? undefined : onBack}
      onSwipeDown={loading ? undefined : onBack}
    >
      <Text style={styles.header}>Are you sure you want to delete your Neobank App profile?</Text>

      <Spacer height={30} />

      <View style={styles.buttons}>
        <OutlineButton
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
          indicatorColor={colors.danger}
          title="Yes, Delete"
          onPress={onConfirm}
          loading={loading}
          disabled={loading}
        />
        <VSpacer width={17} />
        <OutlineButton style={styles.button} title="No" onPress={onBack} disabled={loading} />
      </View>

      <Spacer height={36} />
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  header: {
    ...fonts.h2SemiBold,
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

  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
    flex: 1,
  },
  deleteButtonText: {
    ...fonts.h3SemiBold,
    color: colors.danger,
  },
})
