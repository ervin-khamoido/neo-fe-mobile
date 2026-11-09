import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { StackNavigationOptions } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { OutlineButton } from '../../../component/button-v2'
import { Spacer } from '../../../component/spacer'

import { PaymentNotReceivedBLoC } from './payment-not-received.bloc'
import { MiscStyles } from '../../../component/common'
import { TransactionInfo } from './component/transaction-info'

export const PaymentNotReceivedScreenOptions = ({ route }) => {
  const { headerShown = true } = route.params ?? {}

  return {
    headerShown: headerShown,
    title: '',
  } as StackNavigationOptions
}

export const PaymentNotReceivedScreen = observer(props => {
  const bloc = ioc.useBLoC(PaymentNotReceivedBLoC, props)

  const onPaymentMade = useCallback(() => bloc.onPaymentMade(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.list} edges={Edges}>
        <View style={styles.row}>
          <View style={styles.imageCircle}>
            <VectorImage style={styles.attentionIcon} width={50} height={50} source={AttentionIconSrc} />
          </View>
        </View>
        <Spacer height={24} />

        <Text style={styles.title}>Payment Not Received</Text>
        <Text style={styles.subtitle}>{bloc.activityDate}</Text>
        <Spacer height={24} />

        <Text style={styles.amountUsd}>{bloc.formattedAmountUsd}</Text>
        <Text style={styles.subtitle}>{bloc.formattedAmount}</Text>
        <Spacer height={40} />

        <TransactionInfo item={bloc.activity} />
        <Spacer height={40} />

        <Text style={styles.regularBottomText}>
          If you have made the payment, please attach a screenshot of your proof of payment so we can identify your
          payment.
        </Text>
        <Spacer height={24} />
        <OutlineButton
          style={styles.contactBtn}
          textStyle={styles.contactBtnText}
          title="Contact Support"
          onPress={onPaymentMade}
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
  attentionIcon: { width: 50, height: 50 },
})
