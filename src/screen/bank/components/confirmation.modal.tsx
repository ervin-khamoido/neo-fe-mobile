import React, { memo } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import CheckBox from '@react-native-community/checkbox'

import { BottomModal, BottomModalProps } from '../../../component/modals/bottom-modal'
import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'
import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton } from '../../../component/button'

// ----------------------------------------------------------------
// trigger build
// ----------------------------------------------------------------

type ConfirmationModalProps = {
  fullName: string
  loading: boolean
  toggleRegisterName: boolean
  toggleUnchangeName: boolean

  onBack: () => void
  onConfirm: () => void
  onToggleRgister: () => void
  onToggleUnchange: () => void
} & BottomModalProps

const CheckboxTintColors = {
  true: colors.primary,
  false: colors.primary,
}

export const ConfirmationModal = memo<ConfirmationModalProps>(props => {
  const {
    fullName,
    loading,
    onBack,
    onConfirm,
    toggleRegisterName,
    toggleUnchangeName,
    onToggleRgister,
    onToggleUnchange,
    ...rest
  } = props

  return (
    <BottomModal
      {...rest}
      swipeable={true}
      onSwipeDown={loading ? undefined : onBack}
      onBackdropPress={loading ? undefined : onBack}
    >
      <Text style={styles.header}>Confirm Bank Details</Text>
      <Spacer height={24} />

      <Text style={styles.belongsToTxt}>This Account belongs to</Text>
      <Text style={styles.fullNameTxt}>{fullName}</Text>
      <Spacer height={20} />

      <View style={styles.noteContainer}>
        <View style={styles.confirmRow}>
          <CheckBox
            disabled={loading}
            value={toggleRegisterName}
            onValueChange={onToggleRgister}
            tintColors={CheckboxTintColors}
            tintColor={colors.primary}
            boxType="square"
            onFillColor={colors.primary}
            onCheckColor={colors.input}
            onTintColor={colors.primary}
            onAnimationType="fill"
            offAnimationType="fill"
            style={styles.checkBox}
          />
          <Text style={styles.noteLine}>Your Neobank profile will be registered under this name.</Text>
        </View>
        <View style={styles.confirmRow}>
          <CheckBox
            disabled={loading}
            value={toggleUnchangeName}
            onValueChange={onToggleUnchange}
            tintColors={CheckboxTintColors}
            tintColor={colors.primary}
            boxType="square"
            onFillColor={colors.primary}
            onCheckColor={colors.input}
            onTintColor={colors.primary}
            onAnimationType="fill"
            offAnimationType="fill"
            style={styles.checkBox}
          />
          <Text style={styles.noteLine}>You will not be allowed to change this later.</Text>
        </View>
      </View>
      <Spacer height={80} />

      <View style={styles.buttons}>
        <OutlineButton style={styles.button} title="Back" disabled={loading} onPress={onBack} />
        <VSpacer width={17} />
        <Button
          style={styles.button}
          title="Confirm"
          loading={loading}
          disabled={loading || !toggleRegisterName || !toggleUnchangeName}
          onPress={onConfirm}
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
  },
  belongsToTxt: {
    ...fonts.h5Bold,
    color: colors.textSecondaryDark,
  },
  fullNameTxt: {
    ...fonts.h1Regular,
    color: colors.primary,
  },

  noteContainer: {},
  noteLine: {
    ...fonts.h3Regular,
    color: colors.text,
    marginHorizontal: 10,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 5,
    marginRight: 10,
  },
  checkBox: {
    marginTop: 15,
    height: 20,
    width: 20,
  },
})
