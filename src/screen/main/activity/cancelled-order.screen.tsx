import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView } from 'react-native-gesture-handler'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'
import { ActivityType, RefundedPurchaseOrderReason, RefundedSellOrderReason } from '../../../models'

import { Spacer } from '../../../component/spacer'
import { OutlineButton } from '../../../component/button-v2'
import { MiscStyles } from '../../../component/common'

import { CancelledOrderBLoC } from './cancelled-order.bloc'
import { TransactionInfo } from './component/transaction-info'

export const CancelledOrderScreenOptions = ({ route }) => {
  const { headerShown = true } = route.params ?? {}

  return {
    headerShown: headerShown,
    title: '',
  } as StackNavigationOptions
}

export const CancelledOrderScreen = observer(props => {
  const bloc = ioc.useBLoC(CancelledOrderBLoC, props)

  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.list} edges={Edges}>
        <View style={styles.row}>
          <View style={styles.imageCircle}>
            <VectorImage width={50} height={50} source={AttentionIconSrc} />
          </View>
        </View>
        <Spacer height={24} />

        {bloc.activity.type === ActivityType.Buy && <Text style={styles.title}>Payment Refunded</Text>}
        {bloc.activity.type === ActivityType.Sell && (
          <View>
            {bloc.lastStatus.statusReason === RefundedSellOrderReason.FailedWithdrawing && (
              <Text style={styles.title}>Error in Withdrawing</Text>
            )}
            {bloc.lastStatus.statusReason === RefundedSellOrderReason.Refunded && (
              <Text style={styles.title}>USDC Refunded</Text>
            )}
          </View>
        )}

        <Text style={styles.subtitle}>{bloc.activityDate}</Text>
        <Spacer height={24} />

        <Text style={styles.amountUsd}>{bloc.formattedAmountUsd}</Text>
        <Text style={styles.subtitle}>{bloc.formattedAmount}</Text>
        <Spacer height={40} />

        <TransactionInfo item={bloc.activity} />
        <Spacer height={40} />

        {bloc.activity.type === ActivityType.Buy && (
          <View>
            <Text style={styles.regularBottomText}>
              {bloc.lastStatus.statusReason !== RefundedPurchaseOrderReason.Expired && (
                <Text style={styles.boldBottomText}>Wrong amount sent, </Text>
              )}
              {bloc.lastStatus.statusReason === RefundedPurchaseOrderReason.Expired && (
                <Text style={styles.boldBottomText}>Payment took too long, </Text>
              )}
              we have refunded your money to the source of payment.
            </Text>
          </View>
        )}
        {bloc.activity.type === ActivityType.Sell && (
          <View>
            <Text style={styles.regularBottomText}>
              {bloc.lastStatus.statusReason === RefundedSellOrderReason.FailedWithdrawing && (
                <Text style={styles.boldBottomText}>There was an error in withdrawing USDC from your Neobank wallet.</Text>
              )}
              {bloc.lastStatus.statusReason === RefundedSellOrderReason.Refunded && (
                <Text style={styles.boldBottomText}>
                  There was an error in transfering the funds to your bank account.
                </Text>
              )}{' '}
              Please try again after a few hours.
            </Text>
          </View>
        )}
        <Spacer height={24} />

        <OutlineButton
          style={styles.contactBtn}
          textStyle={styles.contactBtnText}
          title="Contact Support"
          onPress={onSupport}
          loading={bloc.helpCenterLoading}
          disabled={bloc.helpCenterLoading}
        />
        <Spacer height={24} />
      </SafeAreaView>
    </ScrollView>
  )
})
const AttentionIconSrc = require('../../../../assets/images/attention.icon.svg')

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  solidLine: {
    ...MiscStyles.solidLine,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageCircle: {
    padding: 24,
    borderRadius: 100,
    backgroundColor: colors.disabledBackground,
  },
  title: {
    ...fonts.h1SemiBold,
    textAlign: 'center',
    color: colors.text,
  },
  subtitle: {
    ...fonts.h4Regular,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.textLabel,
  },
  amountUsd: {
    ...fonts.numbersM,
    textAlign: 'center',
    color: colors.text,
  },
  contactBtn: {
    borderColor: colors.accent,
  },
  contactBtnText: {
    color: colors.accent,
    ...fonts.h2Regular,
    textAlign: 'center',
  },
  needHelpTxt: {
    textAlign: 'center',
    ...fonts.h6Regular,
    lineHeight: 20,
    color: colors.textLabel,
  },
  regularBottomText: {
    textAlign: 'center',
    ...fonts.h3Regular,
    color: colors.text,
  },
  boldBottomText: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
  buttonText: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
})
