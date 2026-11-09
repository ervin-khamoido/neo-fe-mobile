import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { ActivityType } from '../../../models'
import { Button } from '../../../component/button-v2'
import { Spacer, VSpacer } from '../../../component/spacer'
import { SellOrderReceivedModal } from '../component/sell-order-received-modal'

import { ActivityStatusTimeline } from '../tabs/components/activity-timeline'
import { CopiableTextWidget } from '../tabs/widget/copiable-text.widget'

import { ModalMonitor } from '../../../widget/modal-monitor.widget'

import { PendingDetailsBLoC } from './pending-detail.bloc'
import { Alert } from '../../../component/alert'

export const PendingDetailsOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const PendingDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(PendingDetailsBLoC, props)
  const onBackToWallet = useCallback(() => bloc.onBackToWallet(), [bloc])
  const onToggleReceivedModal = useCallback(() => bloc.onToggleReceivedModal(), [bloc])
  const onToggleConfirmCheckbox = useCallback(() => bloc.onToggleConfirmCheckbox(), [bloc])
  const onConfirmReceivedModal = useCallback(() => bloc.onConfirmReceivedModal(), [bloc])
  const onDisplayValue = useCallback(item => bloc.onDisplayValue(item), [bloc])
  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  const title = bloc.activity.type === ActivityType.Buy ? 'Wait for Confirmation' : 'Transaction Initiated'

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.wrapper} edges={Edges}>
        {bloc.showHolidayBanner && (
          <>
            <Alert text={'Holiday hours might affect the processing time.'} />
            <Spacer height={24} />
          </>
        )}

        <Text style={styles.waitText}>{title}</Text>
        <CopiableTextWidget style={styles.subTitleText} copyText={bloc.orderReference}>
          Order Number: {bloc.activity?.orderReferenceNumber}
        </CopiableTextWidget>
        <Spacer height={24} />

        <Text style={styles.purchaseAmountUSD}>
          {bloc.destCurrencySymbol}
          {onDisplayValue(bloc.activity?.amountUsdc ?? 0)}
        </Text>
        <Text style={styles.subTitleText}>{bloc.srcCurrencySymbol + onDisplayValue(bloc.activity?.amount ?? 0)}</Text>
        <Spacer height={40} />

        <ActivityStatusTimeline statuses={bloc.statuses} />
        <Spacer height={40} />

        <Text style={styles.finalMessage}>You have done your part! We will notify you once done.</Text>
        <Spacer height={24} />

        <View style={styles.contactSupportContainer}>
          <TouchableOpacity>
            <VectorImage width={24} height={24} source={InfoIconSrc} />
          </TouchableOpacity>
          <VSpacer width={4} />

          <Text style={styles.contactSupport} onPress={onSupport}>
            Contact Support
          </Text>
        </View>
        <Spacer height={40} />

        <Button title="Back to Wallet" onPress={onBackToWallet} />
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
          hostComponentName="Pending Detail Screen"
          modalName="Sell Order Received"
        />
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges: Edge[] = ['bottom']
const InfoIconSrc = require('../../../../assets/images/info.icon.svg')

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  subTitleText: {
    flex: 1,
    ...fonts.h4Regular,
    color: colors.textLabel,
    textAlign: 'center',
  },
  contactSupport: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  waitText: {
    ...fonts.h1SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  purchaseAmountUSD: {
    ...fonts.numbersM,
    color: colors.text,
    textAlign: 'center',
  },
  finalMessage: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },
  contactSupportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
