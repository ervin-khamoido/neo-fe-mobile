import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { fonts } from '../../../common/typefaceV2'
import { colors } from '../../../common/colorV2'

import ioc from '../../../ioc'

import { ActivityType } from '../../../models'
import { sizes } from '../../../common/constrants'
import { OutlineButton } from '../../../component/button'
import { TransactionInfo } from './component/transaction-info'
import { Spacer } from '../../../component/spacer'

import { TransactionsDetailsBLoC } from './transactions-detail.bloc'

export const TransactionsDetailsScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const TransactionsDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(TransactionsDetailsBLoC, props)

  const onSupport = useCallback(() => bloc.onSupport(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.list} edges={Edges}>
        <View style={styles.row}>
          <View style={styles.imageCircle}>
            <VectorImage style={styles.checkmarkIcon} width={50} height={50} source={GreenCheckmarkSrc} />
          </View>
        </View>
        <Spacer height={24} />

        <Text style={styles.title}>{transactionTitle[bloc.activity.type]}</Text>
        <Text style={styles.subtitle}>{bloc.activityDate}</Text>
        <Spacer height={24} />

        <Text style={styles.amountUsd}>{bloc.amountWithSymbol}</Text>
        <Text style={styles.subtitle}>{bloc.exchangeAmountWithSymbol}</Text>
        <Spacer height={40} />

        <TransactionInfo item={bloc.activity} />
        <Spacer height={40} />
        <Spacer height={-1} />

        <Text style={styles.needHelpTxt}>Haven’t received it yet?</Text>
        <Spacer height={11} />

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

const GreenCheckmarkSrc = require('../../../../assets/images/checkmark-v2.icon.svg')

const Edges = ['top', 'bottom'] as any

const transactionTitle = {
  [ActivityType.Buy]: 'Added to Wallet',
  [ActivityType.Yield]: 'Added to Wallet',
  [ActivityType.Sell]: 'Credited to Bank Account',
}

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
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageCircle: {
    padding: 24,
    borderRadius: 100,
    backgroundColor: colors.accent,
  },
  checkmarkIcon: {
    tintColor: colors.background,
    width: 50,
    height: 50,
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
})
