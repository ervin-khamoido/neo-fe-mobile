import React, { memo, useCallback, useMemo } from 'react'
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, Platform } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { colors } from '../../../../common/colorV2'
import { ButtonStyles } from '../../../../component/common'
import { BankAccount } from '../../../../models'
import { fonts } from '../../../../common/typeface'
import { VSpacer } from '../../../../component/spacer'

type BankButtonProps = {
  title: string
  loading?: boolean
  isDeleting?: boolean
  isChecked?: (item: BankAccount) => boolean
  onSelectBankAccountToDelete?: (item: BankAccount) => void

  item: BankAccount
  onBankItem: (item: BankAccount) => void
} & Omit<TouchableOpacityProps, 'onPress'>

export const BankButton = memo<BankButtonProps>(props => {
  const {
    title,
    style,
    loading,
    children,
    item,
    isDeleting,
    isChecked,
    onSelectBankAccountToDelete,
    onBankItem,
    ...otherProps
  } = props

  const containerStyle = useMemo(() => StyleSheet.flatten([styles.bankContainer, style]), [style])
  const onPressSelect = useCallback(() => onBankItem(item), [item, onBankItem])
  const onPressDelete = useCallback(() => onSelectBankAccountToDelete(item), [item, onSelectBankAccountToDelete])
  const onDummyDelete = useCallback(() => {}, [])

  return (
    <TouchableOpacity {...otherProps} onPress={isDeleting ? onPressDelete : onPressSelect} style={containerStyle}>
      {!loading && children}
      {loading ? (
        <>
          <Text style={ButtonStyles.outlineText}>
            {' '}
            <ActivityIndicator color={colors.primary} size={'small'} />
          </Text>
        </>
      ) : (
        <>
          {isDeleting && (
            <CheckBox
              disabled={false}
              value={isChecked(item)}
              onValueChange={Platform.OS !== 'ios' ? onPressDelete : onDummyDelete}
              tintColors={{ true: colors.primary, false: colors.primary }}
              tintColor={colors.primary}
              boxType="square"
              onFillColor={colors.primary}
              onCheckColor={colors.input}
              onTintColor={colors.primary}
              onAnimationType="fill"
              offAnimationType="fill"
              style={styles.checkBox}
            />
          )}
          <VSpacer width={16} />
          <Text numberOfLines={1} style={styles.bankText}>
            {title}
          </Text>
          <Text style={styles.bankAccountNumberText}>{item.bankAccountNumberPublic}</Text>
        </>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  bankContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.disabledBackground3,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  bankText: {
    ...fonts.h4Regular,
    color: colors.text,
    width: 157,
  },
  bankAccountNumberText: {
    ...fonts.h4Regular,
    justifyContent: 'space-between',
    color: colors.text,
    lineHeight: 28,
    fontWeight: '600',
  },
  checkBox: {
    height: 20,
    width: 20,
  },
})
