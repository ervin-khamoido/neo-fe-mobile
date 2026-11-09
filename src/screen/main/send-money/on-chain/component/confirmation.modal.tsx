import { Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import { Spacer, VSpacer } from '../../../../../component/spacer'
import CheckBox from '@react-native-community/checkbox'
import { colors } from '../../../../../common/colorV2'
import { Button, OutlineButton } from '../../../../../component/button-v2'
import { BottomModal } from '../../../../../component/modals/bottom-modal'
import React from 'react'
import { fonts } from '../../../../../common/typefaceV2'
import { observer } from 'mobx-react-lite'

type ConfirmationModalPropsType = {
  loading: boolean
  toggleCheckBox: boolean
  showConfirmationModal: boolean

  onCancelModal(): void
  onConfirmModal(): void
  onToggleCheckBoxOne(): void
}

export const ConfirmationModal = observer<ConfirmationModalPropsType>(
  ({ showConfirmationModal, onCancelModal, onConfirmModal, onToggleCheckBoxOne, toggleCheckBox, loading }) => {
    return (
      <BottomModal
        swipeable={false}
        visible={showConfirmationModal}
        onBackdropPress={loading ? undefined : onCancelModal}
        onSwipeDown={loading ? undefined : onCancelModal}
      >
        <View>
          <Spacer height={24} />
          <Text style={styles.modalHeader}>I understand that...</Text>
          <Spacer height={40} />

          <TouchableOpacity style={styles.confirmRow} onPress={onToggleCheckBoxOne}>
            <CheckBox
              style={styles.checkbox}
              disabled={true}
              value={toggleCheckBox}
              onValueChange={onToggleCheckBoxOne}
              tintColors={CheckboxTintColors}
              tintColor={colors.accent}
              boxType="square"
              onFillColor={colors.accent}
              onCheckColor={colors.input}
              onTintColor={colors.accent}
              onAnimationType="fill"
              offAnimationType="fill"
            />
            <VSpacer width={12} />

            <Text style={styles.pointText}>
              I may permanently lose my money if I select the wrong token or network.
            </Text>
          </TouchableOpacity>
          <Spacer height={24} />

          <OutlineButton title="Cancel" disabled={loading} onPress={onCancelModal} />
          <Spacer height={24} />

          <Button
            disabled={!toggleCheckBox || loading}
            title="Confirm & Send"
            loading={loading}
            onPress={onConfirmModal}
          />
        </View>
        <Spacer height={24} />
      </BottomModal>
    )
  },
)

const CheckboxTintColors = {
  true: colors.accent,
  false: colors.accent,
}

const styles = StyleSheet.create({
  modalHeader: {
    ...fonts.h1SemiBold,
    textAlign: 'center',
    color: colors.text,
    maxWidth: 300,
    alignSelf: 'center',
  },
  pointText: {
    flex: 1,
    ...fonts.h4Regular,
    textAlign: 'left',
    color: colors.text,
  },
  confirmRow: {
    flexDirection: 'row',
  },
  checkbox: {
    width: 20,
    height: 20,
  },
})
