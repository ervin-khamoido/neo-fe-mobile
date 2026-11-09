import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, Text, View, Platform } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Edge, initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context'
import CheckBox from '@react-native-community/checkbox'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { BankAccount } from '../../../models'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Button, OutlineButton } from '../../../component/button-v2'
import { BankButton } from './components/bank-button'
import { Spacer, VSpacer } from '../../../component/spacer'
import { BottomModal } from '../../../component/modals/bottom-modal'

import { PayWithBankBLoC } from './pay-with-bank.bloc'
const PlusIconSrc = require('../../../../assets/images/plus.icon.svg')

export const PayWithBankScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

const keyExtractor = (item: BankAccount) => item.uid
const CheckboxTintColors = {
  true: colors.accent,
  false: colors.accent,
}

export const PayWithBankScreen = observer(props => {
  const bloc = ioc.useBLoC(PayWithBankBLoC, props)

  const onAddBankAccount = useCallback(() => bloc.onAddBankAccount(), [bloc])
  const handleBankButton = useCallback(item => bloc.onBankAccount(item), [bloc])
  const onConfirmModal = useCallback(() => bloc.onConfirmModal(), [bloc])
  const onCancelModal = useCallback(() => bloc.onCancelModal(), [bloc])
  const onToggleCheckBoxOne = useCallback(() => bloc.onToggleCheckBoxOne(), [bloc])
  const onToggleCheckBoxTwo = useCallback(() => bloc.onToggleCheckBoxTwo(), [bloc])

  const renderItem: ListRenderItem<BankAccount> = ({ item }) => (
    <>
      <BankButton
        key={item.bank + item.bankAccountNumberPublic}
        title={item.bankName}
        item={item}
        onBankItem={handleBankButton}
        loading={bloc.loadingBankAccount === item.uid}
        disabled={bloc.loading}
      />
      <Spacer height={8} />
    </>
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <View style={styles.row}>
        <Text style={styles.boldText}>Select an account</Text>
      </View>
      <Spacer height={8} />

      <View style={styles.infoRow}>
        <Text style={styles.subHeading}>Select the account you would like to use for the bank transfer</Text>
      </View>
      <Spacer height={40} />

      <OutlineButton
        style={styles.addBankBtn}
        textStyle={styles.addBankBtnText}
        disabled={bloc.loading || bloc.addBankLoading}
        loading={bloc.addBankLoading}
        title="Add Account"
        onPress={onAddBankAccount}
      >
        <VectorImage style={styles.plusIcon} width={20} height={20} source={PlusIconSrc} />
        <VSpacer width={12} />
      </OutlineButton>

      <FlatList<BankAccount>
        data={bloc.banks}
        extraData={[bloc.loadingBankAccount, bloc.loading]}
        contentContainerStyle={styles.list}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      <BottomModal
        swipeable={false}
        visible={bloc.showConfirmationModal}
        onBackdropPress={bloc.loading ? undefined : onCancelModal}
        onSwipeDown={bloc.loading ? undefined : onCancelModal}
      >
        <View style={styles.modalContainer}>
          <Spacer height={24} />
          <Text style={styles.modalHeader}>I Confirm That</Text>
          <Spacer height={40} />

          <View style={styles.confirmRow}>
            <CheckBox
              style={styles.checkbox}
              disabled={false}
              value={bloc.toggleCheckBoxOne}
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
              I will not include crypto related words like BTC, ETH, Crypto or Neobank in the payment Reference
            </Text>
          </View>
          <Spacer height={20} />

          <View style={styles.confirmRow}>
            <CheckBox
              style={styles.checkbox}
              disabled={false}
              value={bloc.toggleCheckBoxTwo}
              onValueChange={onToggleCheckBoxTwo}
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
              I will transfer the money from a bank account with the same name as my BVN
            </Text>
          </View>
          <Spacer height={24} />

          <OutlineButton title="Cancel" disabled={bloc.loading} onPress={onCancelModal} />
          <Spacer height={24} />

          <Button
            disabled={!bloc.toggleCheckBoxOne || !bloc.toggleCheckBoxTwo || bloc.loading}
            title="Confirm"
            loading={bloc.loading}
            onPress={onConfirmModal}
          />
        </View>
        <Spacer height={24} />
      </BottomModal>
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boldText: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  subHeading: {
    ...fonts.h3Regular,
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addBankBtn: {
    padding: 24,
    paddingVertical: 25,
    justifyContent: 'flex-start',
    borderRadius: 20,
    borderColor: colors.gray7,
  },
  addBankBtnText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  plusIcon: {
    tintColor: colors.textLabel,
    width: 20,
    height: 20,
  },
  list: {
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? initialWindowMetrics.insets.bottom : 0,
  },
  modalContainer: {},
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
