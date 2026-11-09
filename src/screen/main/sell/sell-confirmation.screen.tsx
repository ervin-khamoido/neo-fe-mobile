import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'

import { fonts } from '../../../common/typefaceV2'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import ioc from '../../../ioc'

import { Button, OutlineButton } from '../../../component/button-v2'
import { Spacer } from '../../../component/spacer'
import { Timer } from '../../../component/timer'
import { BottomModal } from '../../../component/modals/bottom-modal'
import { SellConfirmationBLoC } from './sell-confirmation.bloc'
import { displayCurrency } from '../../../lib/utils/helpers'

export const SellConfirmationScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const SellConfirmationScreen = observer(props => {
  const bloc = ioc.useBLoC(SellConfirmationBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onCancel = useCallback(() => bloc.onCancel(), [bloc])
  const onConfirmCancel = useCallback(() => bloc.onConfirmCancel(), [bloc])

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.wrapper} edges={Edges}>
        <Text style={styles.boldText}>
          You will get {bloc.destCurrencySymbol}
          {displayCurrency(bloc.total).format()}
        </Text>
        <Spacer height={40} />

        <Text style={styles.instructionText}>Transaction details for your withdrawal:</Text>
        <Spacer height={24} />

        <View style={styles.transactionInfo}>
          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Name</Text>
              <Text style={styles.boldTextSmall}>{bloc.selectedBankAccount.bankName}</Text>
            </View>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />
          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Account Number</Text>
              <Text style={styles.boldTextSmall}>{bloc.selectedBankAccount.bankAccountNumber}</Text>
            </View>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Account Name</Text>
              <Text style={styles.boldTextSmall}>{bloc.selectedBankAccountHolder}</Text>
            </View>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>You Get</Text>
              <Text style={styles.boldTextSmall}>
                {bloc.destCurrencySymbol} {displayCurrency(bloc.total).format()}
              </Text>
            </View>
          </View>
        </View>
        <Spacer height={40} />

        <View style={styles.clockRow}>
          <Text style={styles.completeTxt}>Complete the transaction within</Text>
          <Spacer height={4} />

          <Timer style={styles.row} endTS={bloc.sellEndTS} />
        </View>
        <Spacer height={40} />

        <Spacer height={-1} />

        <OutlineButton
          style={styles.cancelBtn}
          textStyle={styles.cancelBtnText}
          title="Cancel"
          disabled={bloc.loading}
          onPress={onCancel}
        />
        <Spacer height={24} />

        <Button title="Withdraw" disabled={bloc.loading} loading={bloc.loading} onPress={onSubmit} />
        <Spacer height={24} />

        <BottomModal
          swipeable={true}
          visible={bloc.showBottomSheet}
          onBackdropPress={bloc.loading ? undefined : onCancel}
          onSwipeDown={bloc.loading ? undefined : onCancel}
        >
          <Text style={styles.modalHeader}>Are you sure you want to Cancel this order?</Text>

          <View style={styles.modalButtonRow}>
            <OutlineButton
              style={styles.modalCancelButton}
              textStyle={styles.modalBtnTxt}
              title="Yes, Cancel"
              loading={bloc.loading}
              disabled={bloc.loading}
              onPress={onConfirmCancel}
              indicatorColor={colors.danger}
            />
            <OutlineButton style={styles.modalButton} disabled={bloc.loading} title="No" onPress={onCancel} />
          </View>
        </BottomModal>
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clockRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    ...fonts.h6Regular,
    color: colors.textSecondaryDark,
  },
  boldText: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  boldTextSmall: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  instructionText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  transactionInfo: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: colors.disabledBackground3,
  },
  cancelBtn: {
    borderColor: colors.accent,
  },
  cancelBtnText: {
    color: colors.accent,
    ...fonts.h2Regular,
    textAlign: 'center',
  },
  modalButtonRow: {
    marginTop: 40,
    marginBottom: 20,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    width: '47%',
  },
  modalCancelButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
    width: '47%',
  },
  modalBtnTxt: {
    ...fonts.h3SemiBold,
    lineHeight: 28,
    color: colors.danger,
  },
  modalHeader: {
    ...fonts.h2SemiBold,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 10,
    paddingHorizontal: 50,
  },
  modal: {
    margin: 0,
    position: 'absolute',
    width: '100%',
    bottom: 0,
    backgroundColor: colors.input,
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
  },
  completeTxt: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.gray3,
  },
  line: {
    borderBottomColor: colors.gray4,
    borderBottomWidth: 1.5,
  },
})
