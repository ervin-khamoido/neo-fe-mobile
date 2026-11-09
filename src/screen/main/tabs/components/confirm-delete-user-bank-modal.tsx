import React, { memo } from 'react'
import { Text, StyleSheet, View } from 'react-native'

import { BottomModal, BottomModalProps } from '../../../../component/modals/bottom-modal'
import { fonts } from '../../../../common/typeface'
import { colors } from '../../../../common/constrants'
import { Spacer, VSpacer } from '../../../../component/spacer'
import { Button, OutlineButton } from '../../../../component/button'
import { Space } from '../../../../lib/utils/easing'

type ConfirmDeleteUserBankAccountModalProps = {
  onBack: () => void
  onConfirm: () => void
  loading?: boolean
  deleteLoading: boolean
  isMultiple?: boolean
} & BottomModalProps
export const ConfirmDeleteUserBankAccountModal = memo<ConfirmDeleteUserBankAccountModalProps>(props => {
  const { onBack, onConfirm, loading, deleteLoading, isMultiple, ...rest } = props

  return (
    <BottomModal
      {...rest}
      swipeable={true}
      onSwipeDown={loading ? undefined : onBack}
      onBackdropPress={loading ? undefined : onBack}
    >
      <Spacer height={30} />
      <Text style={styles.modalHeader}>
        Are you sure you want to delete {isMultiple ? 'these accounts?' : 'this account?'}
      </Text>
      <Spacer height={35} />
      <View style={styles.modalButtonRow}>
        <OutlineButton
          style={[styles.modalDeleteButton, styles.modalButton]}
          textStyle={styles.deleteButtonText}
          title="Yes, Delete"
          disabled={loading || deleteLoading}
          loading={deleteLoading}
          onPress={onConfirm}
        />
        <OutlineButton
          style={styles.modalButton}
          textStyle={styles.buttonText}
          title="No"
          disabled={loading || deleteLoading}
          onPress={onBack}
        />
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
  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
    flex: 1,
  },
  deleteButtonText: {
    ...fonts.h3SemiBold,
    color: colors.danger,
  },
  modalDeleteButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
  },
  modalHeader: {
    ...fonts.h2SemiBold,
    textAlign: 'center',
    color: colors.text,
    paddingHorizontal: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    width: '47%',
  },

  buttonText: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
})
