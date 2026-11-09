import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typeface'
import { Button, OutlineButton } from '../../../component/button-v2'
import CheckBox from '@react-native-community/checkbox'
import { BottomModal, BottomModalProps } from '../../../component/modals/bottom-modal'
import { Spacer } from '../../../component/spacer'

type SellOrderReceivedModal = {
  loading: boolean
  cancel: () => void
  checkboxValue: boolean
  checkboxToggle: () => void
  confirm: () => void
} & BottomModalProps

const CheckboxTintColors = {
  true: colors.accent,
  false: colors.accent,
}
export const SellOrderReceivedModal = memo<SellOrderReceivedModal>(props => {
  const { loading, cancel, checkboxValue, checkboxToggle, confirm, ...rest } = props

  return (
    <BottomModal
      {...rest}
      swipeable={true}
      onSwipeDown={loading ? undefined : cancel}
      onBackdropPress={loading ? undefined : cancel}
    >
      <View>
        <Text style={styles.modalHeader}>I confirm that</Text>
        <View style={styles.confirmRow}>
          <CheckBox
            disabled={false}
            value={checkboxValue}
            onValueChange={checkboxToggle}
            tintColors={CheckboxTintColors}
            tintColor={colors.accent}
            boxType="square"
            onFillColor={colors.accent}
            onCheckColor={colors.input}
            onTintColor={colors.accent}
            onAnimationType="fill"
            offAnimationType="fill"
            style={styles.checkBox}
          />
          <Text style={styles.modalBody}>I have received the exact amount of money in my bank account.</Text>
        </View>
        <Spacer height={24} />
        <View style={styles.modalButtonRow}>
          <OutlineButton title="Cancel" onPress={cancel} disabled={loading} indicatorColor={colors.background} />
          <Spacer height={24} />
          <Button disabled={!checkboxValue || loading} title="Confirm" loading={loading} onPress={confirm} />
        </View>
      </View>
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  modalButtonRow: {
    marginBottom: 20,
  },
  modalHeader: {
    ...fonts.h2SemiBold,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 10,
    maxWidth: 300,
    alignSelf: 'center',
  },
  modalBody: {
    ...fonts.h4Regular,
    textAlign: 'left',
    color: colors.text,
    marginHorizontal: 15,
  },
  confirmRow: {
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
  },
  checkBox: {
    height: 20,
    width: 20,
  },
})
