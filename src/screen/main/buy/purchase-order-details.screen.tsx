import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { TouchableOpacity } from 'react-native-gesture-handler'
import VectorImage from 'react-native-vector-image'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import ioc from '../../../ioc'

import { Button } from '../../../component/button-v2'
import { ActivityStatusTimeline } from '../tabs/components/activity-timeline'
import { PurchaseOrderDetailsBLoC } from './purchase-order-details.bloc'
import { Spacer, VSpacer } from '../../../component/spacer'
import { CopiableTextWidget } from '../tabs/widget/copiable-text.widget'
import { Alert } from '../../../component/alert'

export const PurchaseOrderDetailsOptions: StackNavigationOptions = {
  headerShown: false,
  title: 'Deposit Details',
}

export const PurchaseOrderDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(PurchaseOrderDetailsBLoC, props)

  const onBackToWallet = useCallback(() => bloc.onBackToWallet(), [bloc])
  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  return (
    <ScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.wrapper} edges={Edges}>
        <Spacer height={40} />
        {bloc.showHolidayBanner && (
          <>
            <Alert text={'Holiday hours might affect the processing time.'} />
            <Spacer height={24} />
          </>
        )}

        <Text style={styles.waitText}>Wait for Confirmation</Text>
        <CopiableTextWidget style={styles.subTitleText} copyText={bloc.orderReference}>
          Order Number: {bloc.orderReference}
        </CopiableTextWidget>
        <Spacer height={24} />

        <Text style={styles.purchaseAmountUSD}>{bloc.formattedAmountUsdc}</Text>
        <Text style={styles.subTitleText}>{bloc.formattedAmount}</Text>
        <Spacer height={40} />

        <ActivityStatusTimeline statuses={bloc.statuses} />
        <Spacer height={40} />

        <Text style={styles.finalMessage}>You have done your part! We will notify you once done.</Text>
        <Spacer height={24} />

        <TouchableOpacity style={styles.contactSupportContainer} onPress={onSupport}>
          <VectorImage style={styles.infoIcon} width={24} height={24} source={InfoIconSrc} />
          <VSpacer width={4} />

          <Text style={styles.contactSupport}>Contact Support</Text>
        </TouchableOpacity>
        <Spacer height={40} />

        <Button title="Back to Wallet" onPress={onBackToWallet} />
        <Spacer height={24} />
      </SafeAreaView>
    </ScrollView>
  )
})

const InfoIconSrc = require('../../../../assets/images/info-bold.icon.svg')

const Edges = ['top', 'bottom'] as any

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
  infoIcon: {
    width: 24,
    height: 24,
  },
})
