import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../../../common/constrants'
import Modal from 'react-native-modal'
import { ActivityType } from '../../../../models'

type CanCreateModalProps = {
  type: string
  visible: boolean
  onToggle: () => void
}

export const CanCreateModal = memo<CanCreateModalProps>(props => {
  const { visible, onToggle, type } = props
  const orderTypeText = type === ActivityType.Buy ? 'Deposit' : 'Withdraw'

  return (
    <>
      <Modal
        isVisible={visible}
        backdropTransitionOutTiming={0}
        backdropTransitionInTiming={0}
        swipeDirection={'down'}
        onSwipeComplete={onToggle}
        onBackButtonPress={onToggle}
        onBackdropPress={onToggle}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalHeading}>Previous {orderTypeText} Pending</Text>
          <Text style={styles.modalBody}>
            You have a pending {orderTypeText} transaction. Please go to your activity page to complete or cancel the
            transaction before initiating another transaction.
          </Text>
          <View style={styles.modalGreyLine} />
          <TouchableOpacity onPress={onToggle}>
            <Text style={styles.modalAcceptText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
})

const styles = StyleSheet.create({
  modalView: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 16,
  },
  modalAcceptText: {
    color: colors.primary,
    textAlign: 'center',
  },
  modalHeading: {
    color: colors.text,
    fontWeight: '600',
    lineHeight: 32,
    fontSize: 20,
    textAlign: 'center',
  },
  modalBody: {
    color: colors.text,
    textAlign: 'center',
  },
  modalGreyLine: {
    borderBottomColor: colors.disabled,
    borderBottomWidth: 1,
    width: '90%',
    marginVertical: 15,
  },
})
