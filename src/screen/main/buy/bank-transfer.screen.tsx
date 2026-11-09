import React, { useCallback, useMemo } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { StackNavigationOptions } from '@react-navigation/stack'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import ioc from '../../../ioc'

import { BankTransferBLoC } from './bank-transfer.bloc'
import { Timer } from '../../../component/timer'
import { SimpleModal } from '../../../component/modals/simple-modal'
import { BottomModal } from '../../../component/modals/bottom-modal'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'
import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton } from '../../../component/button-v2'

export const BankTransferScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const BankTransferScreen = observer(props => {
  const bloc = ioc.useBLoC(BankTransferBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onCancel = useCallback(() => bloc.onCancel(), [bloc])
  const onConfirmCancel = useCallback(() => bloc.onConfirmCancel(), [bloc])
  const onPaid = useCallback(() => bloc.onPaid(), [bloc])
  const onTimeOut = useCallback(() => bloc.onTimeOut(), [bloc])
  const slowDownModalBtn = useMemo(() => ({ title: 'Okay', onPress: () => bloc.onSlowDownModalClose() }), [bloc])

  const onCopyBankName = useCallback(() => bloc.onCopyInClipboard('sellerBankName'), [bloc])
  const onCopyBankAccountName = useCallback(() => bloc.onCopyInClipboard('sellerBankAccountName'), [bloc])
  const onCopyBankAccountNumber = useCallback(() => bloc.onCopyInClipboard('sellerBankAccountNumber'), [bloc])
  const onCopyOrderNo = useCallback(() => bloc.onCopyInClipboard('orderNumber'), [bloc])
  const onCopyAmount = useCallback(() => bloc.onCopyInClipboard('total'), [bloc])

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.wrapper} edges={Edges}>
        <Text style={styles.boldText}>Make Payment</Text>
        <Spacer height={40} />

        <View style={styles.instructionContainer}>
          <View style={styles.pointContainer}>
            <View style={styles.circleContainer}>
              <Text style={styles.circleText}>1</Text>
            </View>

            <View style={styles.connectingLine} />
          </View>
          <VSpacer width={12} />

          <Text style={styles.instructionText}>
            Leave this app, open your own bank or payment platform to transfer the funds to the agent's account provided
            below.
          </Text>
          <Spacer height={20} />
        </View>

        <View style={styles.transactionInfo}>
          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Name</Text>
              <Text style={styles.boldTextSmall}>{bloc.sellerBankName}</Text>
            </View>
            <TouchableOpacity onPress={onCopyBankName} disabled={bloc.disabled}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </TouchableOpacity>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />
          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Account Number</Text>
              <Text style={styles.boldTextSmall}>{bloc.sellerBankAccountNumber}</Text>
            </View>
            <TouchableOpacity onPress={onCopyBankAccountNumber} disabled={bloc.disabled}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </TouchableOpacity>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Bank Account Name</Text>
              <Text style={styles.boldTextSmall}>{bloc.sellerBankAccountName}</Text>
            </View>
            <TouchableOpacity onPress={onCopyBankAccountName} disabled={bloc.disabled}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </TouchableOpacity>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Order No.</Text>
              <Text style={styles.boldTextSmall}>{bloc.orderNumber}</Text>
            </View>
            <TouchableOpacity onPress={onCopyOrderNo} disabled={bloc.disabled}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </TouchableOpacity>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.bankInfoRow}>
            <View>
              <Text style={styles.infoTitle}>Amount</Text>
              <Text style={styles.boldTextSmall}>{bloc.formattedTotal}</Text>
            </View>
            <TouchableOpacity onPress={onCopyAmount} disabled={bloc.disabled}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.instructionContainer}>
          <View style={styles.pointContainer2}>
            <View style={styles.connectingLine} />

            <View style={styles.circleContainer}>
              <Text style={styles.circleText}>2</Text>
            </View>
          </View>
          <VSpacer width={12} />

          <Text style={styles.instructionText2}>
            Once you've made the payment, come back here to confirm by pressing “Paid”
          </Text>
        </View>
        <Spacer height={40} />

        <View style={styles.clockRow}>
          <Text style={styles.completeTxt}>Complete the transaction within</Text>
          <Spacer height={4} />

          <Timer style={styles.row} endTS={bloc.buyEndTS} onTimeOut={onTimeOut} />
        </View>
        <Spacer height={40} />

        <Spacer height={-1} />

        <OutlineButton title="Cancel" disabled={bloc.disabled} onPress={onCancel} />
        <Spacer height={24} />

        <Button title="Paid" loading={bloc.loading} disabled={bloc.disabled} onPress={onPaid} />
        <Spacer height={24} />

        <SimpleModal
          visible={bloc.showSlowDownModal}
          header="Slow down"
          body="Make sure you transfer money to our agent before you click 'Paid'"
          button={slowDownModalBtn}
        />
        <ModalMonitor
          isVisible={bloc.showSlowDownModal}
          hostComponentName="Bank Transfer Screen"
          modalName="Slow Down Modal"
        />

        <BottomModal
          swipeable={true}
          visible={bloc.showOutsideTimeLimitModal}
          onBackdropPress={onSubmit}
          onSwipeDown={onSubmit}
        >
          <Text style={styles.modalBody}>
            Because you made the transaction outside the payment window, your transaction might be refunded if the
            exchange rate has changed.
          </Text>
          <View style={styles.modalButtonRow}>
            <OutlineButton
              title="Okay"
              loading={bloc.loading}
              disabled={bloc.disabled}
              onPress={onSubmit}
              style={styles.modalButton}
            />
          </View>
        </BottomModal>
        <ModalMonitor
          isVisible={bloc.showOutsideTimeLimitModal}
          hostComponentName="Bank Transfer Screen"
          modalName="Outside Time Limit Modal"
        />

        <BottomModal
          swipeable={true}
          visible={bloc.showBottomSheet}
          onBackdropPress={bloc.loading ? undefined : onCancel}
          onSwipeDown={bloc.loading ? undefined : onCancel}
        >
          <View>
            <Text style={styles.modalHeader}>Are you sure you want to Cancel this deposit?</Text>
            <Text style={styles.modalBody}>
              If you cancel the deposit after you have made a payment, it might take up 48 hours to process your refund.
            </Text>
            <View style={styles.modalButtonRow}>
              <OutlineButton
                style={styles.modalCancelButton}
                textStyle={styles.modalBtnTxt}
                title="Yes, Cancel"
                loading={bloc.loading}
                disabled={bloc.disabled || bloc.loading}
                onPress={onConfirmCancel}
                indicatorColor={colors.danger}
              />
              <OutlineButton
                style={styles.modalButton}
                loading={bloc.loading}
                disabled={bloc.disabled || bloc.loading}
                title="No"
                onPress={onCancel}
              />
            </View>
          </View>
        </BottomModal>
        <ModalMonitor
          isVisible={bloc.showBottomSheet}
          hostComponentName="Bank Transfer Screen"
          modalName="Cancel Purchase Order Modal"
        />
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges: Edge[] = ['bottom']
const CopyIconSrc = require('../../../../assets/images/copy.icon.svg')

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.margin,
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
  line: {
    borderBottomColor: colors.gray4,
    borderBottomWidth: 1.5,
  },
  bankInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boldText: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  infoTitle: {
    ...fonts.h6Regular,
    color: colors.textSecondaryDark,
  },
  boldTextSmall: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  instructionText: {
    marginBottom: 20,
    flex: 1,
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  instructionText2: {
    marginTop: 32,
    flex: 1,
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointContainer2: {
    marginBottom: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleContainer: {
    width: 40,
    height: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: 48,
  },
  circleText: {
    ...fonts.h4Bold,
    lineHeight: 20,
    color: colors.accent,
  },
  transactionInfo: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
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
  connectingLine: {
    flex: 1,
    width: 2,
    height: 16,
    backgroundColor: colors.disabledBackground4,
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
  modalBtnTxt: {
    ...fonts.h3Bold,
    lineHeight: 28,
    color: colors.danger,
  },
  modalCancelButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
    width: '47%',
  },
  modalHeader: {
    ...fonts.h2SemiBold,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 10,
    maxWidth: 300,
    alignSelf: 'center',
  },
  modalBody: {
    ...fonts.h3Regular,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 0,
    paddingHorizontal: 20,
  },
  completeTxt: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
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
  copyIcon: {
    width: 24,
    height: 24,
  },
})
