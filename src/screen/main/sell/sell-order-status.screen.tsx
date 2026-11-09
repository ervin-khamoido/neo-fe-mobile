import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { TouchableOpacity } from 'react-native-gesture-handler'
import ioc from '../../../ioc'
import { OutlineButton, Button } from '../../../component/button-v2'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { SellOrderStatusBLoC } from './sell-order-status.bloc'
import { ActivityStatusTimeline } from '../tabs/components/activity-timeline'
import { SellOrderActivityStatus } from '../../../models'
import { SellOrderReceivedModal } from '../component/sell-order-received-modal'
import { CopiableTextWidget } from '../tabs/widget/copiable-text.widget'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'
import { Spacer, VSpacer } from '../../../component/spacer'
import { Alert } from '../../../component/alert'

export const SellOrderStatusScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const SellOrderStatusScreen = observer(props => {
  const bloc = ioc.useBLoC(SellOrderStatusBLoC, props)

  const activity = bloc.activity
  const wasTransferSuccessful = activity.status === SellOrderActivityStatus.TransferSuccessful

  const onBackToWallet = useCallback(() => bloc.onBackToWallet(), [bloc])
  const onToggleReceivedModal = useCallback(() => bloc.onToggleReceivedModal(), [bloc])
  const onConfirmReceivedModal = useCallback(() => bloc.onConfirmReceivedModal(), [bloc])
  const onToggleConfirmCheckbox = useCallback(() => bloc.onToggleConfirmCheckbox(), [bloc])
  const onDisplayValue = useCallback(item => bloc.onDisplayValue(item), [bloc])
  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  const isProssesComplited = bloc.statuses[bloc.statuses.length - 1].completed
  const title = isProssesComplited ? 'Order Completed!' : 'Transaction Initiated'

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.wrapper} edges={Edges}>
        {bloc.showHolidayBanner && !isProssesComplited && (
          <>
            <Alert text={'Holiday hours might affect the processing time.'} />
            <Spacer height={24} />
          </>
        )}

        <Text style={styles.title}>{title}</Text>
        <CopiableTextWidget style={styles.subTitleText} copyText={bloc.activity.orderReferenceNumber}>
          Order Number: {bloc.activity.orderReferenceNumber}
        </CopiableTextWidget>
        <Spacer height={24} />

        <Text style={styles.purchaseAmountUSD}>
          {bloc.destCurrencySymbol}
          {onDisplayValue(activity.amountUsdc)}
        </Text>
        <Text style={styles.subPurchaseAmount}>
          {bloc.srcCurrencySymbol}
          {onDisplayValue(activity.amount)}
        </Text>
        <Spacer height={40} />

        <ActivityStatusTimeline statuses={bloc.statuses} />
        <Spacer height={40} />

        <Text style={styles.finalMessage}>You have done your part! We will notify you once done.</Text>
        <Spacer height={24} />

        <TouchableOpacity style={styles.contactSupportContainer} onPress={onSupport}>
          <VectorImage style={styles.infoIcon} width={18} height={18} source={InfoIconSrc} />
          <VSpacer width={4} />
          <Text style={styles.contactSupportText}>Contact Support</Text>
        </TouchableOpacity>
        <Spacer height={24} />

        {isProssesComplited ? (
          <>
            <OutlineButton
              style={styles.backWalletBtn}
              textStyle={styles.backWalletBtnText}
              title="Back to Wallet"
              disabled={bloc.loading}
              onPress={onBackToWallet}
            />
            <Spacer height={24} />

            <Button
              style={styles.paintedBtn}
              textStyle={styles.paintedBtnText}
              disabled={!wasTransferSuccessful || bloc.loading}
              title="Received"
              onPress={onToggleReceivedModal}
            />
          </>
        ) : (
          <Button
            style={styles.paintedBtn}
            textStyle={styles.paintedBtnText}
            title="Back to Wallet"
            disabled={bloc.loading}
            onPress={onBackToWallet}
          />
        )}

        <Spacer height={24} />

        <SellOrderReceivedModal
          visible={bloc.showReceivedModal}
          swipeable={false}
          loading={bloc.loading}
          cancel={onToggleReceivedModal}
          checkboxValue={bloc.confirmCheckbox}
          checkboxToggle={onToggleConfirmCheckbox}
          confirm={onConfirmReceivedModal}
        />
        <ModalMonitor
          isVisible={bloc.showReceivedModal}
          hostComponentName="Sell Order Status Screen"
          modalName="Sell Order Received"
        />
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges = ['top', 'bottom'] as any
const InfoIconSrc = require('../../../../assets/images/info-bold.icon.svg')

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  title: {
    ...fonts.h1SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  subTitleText: {
    flex: 1,
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  purchaseAmountUSD: {
    textAlign: 'center',
    ...fonts.numbersS,
    color: colors.text,
  },
  subPurchaseAmount: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  finalMessage: {
    textAlign: 'center',
    ...fonts.h4Regular,
    color: colors.text,
  },
  contactSupportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactSupportText: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  backWalletBtn: {
    borderColor: colors.accent,
  },
  backWalletBtnText: {
    color: colors.accent,
  },
  paintedBtn: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  paintedBtnText: {
    color: colors.textLight,
  },
  infoIcon: {
    width: 18,
    height: 18,
  },
})
