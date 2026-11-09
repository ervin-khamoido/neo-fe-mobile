import React, { memo, useCallback } from 'react'
import { Observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { ActivityType } from '../../../models'
import { fonts } from '../../../common/typeface'
import { colors, sizes } from '../../../common/constrants'
import { TransactionsActivityTitle } from './common'

import { OutlineButton } from '../../../component/button'
import { TransactionInfo } from './component/transaction-info'
import { Spacer } from '../../../component/spacer'

import { MoneyTransferDetailsBLoC } from './money-transfer-detail.bloc'

export const MoneyTransferDetailsScreenOptions = ({ route }) => {
  const { headerShown = true } = route?.params ?? {}

  return {
    headerShown: headerShown,
    title: TransactionsActivityTitle,
  } as StackNavigationOptions
}

export const MoneyTransferDetailsScreen = memo(props => {
  const bloc = ioc.useBLoC(MoneyTransferDetailsBLoC, props)

  const onSupport = useCallback(() => bloc.onSupport(), [bloc])
  const onBackToWallet = useCallback(() => bloc.onBackToWallet(), [bloc])

  const getTransactionSign = (): string => {
    switch (bloc.activity.type) {
      case ActivityType.Transfer_Send:
        return '-'
      case ActivityType.Transfer_Receive:
        return '+'
      default:
    }
  }

  return (
    <Observer>
      {() => (
        <ScrollView style={styles.list} contentContainerStyle={styles.container}>
          <SafeAreaView style={styles.list} edges={Edges}>
            <View style={styles.centerContent}>
              <Spacer height={20} />
              <View style={styles.centerContent}>
                <VectorImage style={styles.greenCheckmarkIcon} width={50} height={50} source={GreenCheckmarkSrc} />
              </View>
              <Spacer height={40} />
              <View style={styles.centerContent}>
                <Text style={styles.addedText}>Money Transfer</Text>
              </View>
              <View style={styles.centerContent}>
                <Text style={styles.text}>{bloc.displayStatusDate}</Text>
              </View>
              <Spacer height={10} />
              <View style={styles.centerContent}>
                <Text style={styles.purchaseAmountUSD}>
                  {getTransactionSign()}
                  {bloc.displayUSDAmount}
                </Text>
              </View>
              <View style={styles.centerContent}>
                <Text style={styles.exchangeAmountNaira}>{bloc.displayNGNAmount}</Text>
              </View>
            </View>

            <Spacer height={50} />

            <TransactionInfo item={bloc.activity} />

            <Spacer height={-1} />

            <View style={styles.bottomContainer}>
              <View style={styles.didntReceiveTextContainer}>
                <Text style={styles.needHelpTxt}>Need help?</Text>
              </View>

              <OutlineButton title="&nbsp;Contact Support" onPress={onSupport}>
                <VectorImage style={styles.infoIcon} width={18} height={18} source={InfoIconSrc} />
              </OutlineButton>

              {!bloc.backToWalletShows && (
                <>
                  <Spacer height={14} />
                  <OutlineButton title="Back to Wallet" onPress={onBackToWallet} />
                </>
              )}
            </View>
          </SafeAreaView>
        </ScrollView>
      )}
    </Observer>
  )
})

const GreenCheckmarkSrc = require('../../../../assets/images/green-circle-checkmark-unfilled.icon.svg')
const InfoIconSrc = require('../../../../assets/images/info.icon.svg')

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.margin,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  bottomContainer: {
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  text: {
    ...fonts.h5Regular,
    color: colors.text,
  },
  addedText: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  purchaseAmountUSD: {
    ...fonts.numbersS,
    color: colors.text,
  },
  exchangeAmountNaira: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  didntReceiveTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  needHelpTxt: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  infoIcon: {
    width: 18,
    height: 18,
  },
  greenCheckmarkIcon: {
    width: 50,
    height: 50,
  },
})
