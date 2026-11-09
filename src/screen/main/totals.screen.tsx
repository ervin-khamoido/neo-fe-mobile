import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'

import ioc from '../../ioc'

import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typefaceV2'

import { Spacer, VSpacer } from '../../component/spacer'
import { Button } from '../../component/button-v2'
import { ScreenMode } from '../../models'

import { TotalsBLoC } from './totals.bloc'

export const TotalsScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const TotalsScreen = observer(props => {
  const bloc = ioc.useBLoC(TotalsBLoC, props)

  const screenModeTitle = bloc.mode === ScreenMode.Buy ? 'deposit' : 'withdraw'
  const screenModeTotalTitle = bloc.mode === ScreenMode.Buy ? 'Amount to be credited' : 'You Get'
  const screenModeTotalAmount = bloc.mode === ScreenMode.Buy ? bloc.formattedAmount : bloc.formattedTotal
  const screenModeButtonText = bloc.mode === ScreenMode.Buy ? 'Deposit' : 'Withdraw'

  const onEdit = useCallback(() => bloc.onEdit(), [bloc])
  const onBankTransfer = useCallback(() => bloc.onBankTransfer(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.header}>How much would you like to {screenModeTitle}?</Text>
      <Spacer height={40} />

      <View style={styles.amountWrapper}>
        <View style={styles.amountColumn}>
          <Text style={styles.amount}>{bloc.formattedAmount}</Text>
          <Text style={styles.exchangeRate}>{bloc.formattedExchangeRate}</Text>
        </View>

        <VSpacer width={8} />
        <TouchableOpacity style={styles.editBtnWrapper} onPress={onEdit}>
          <VectorImage style={styles.editIcon} width={24} height={24} source={EditIconSrc} />
        </TouchableOpacity>
      </View>
      <Spacer height={40} />

      <View style={styles.line} />
      <Spacer height={20} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Transaction Type</Text>
        <Text style={styles.transactionTypeText}>{renderTransactionTypeTitle[bloc.mode]}</Text>
      </View>
      <Spacer height={20} />

      {bloc.mode === ScreenMode.Buy && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>You are to transfer</Text>
            <Text style={styles.info}>{bloc.formattedTotal}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      {bloc.mode === ScreenMode.Sell && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Amount Withdrawn</Text>
            <Text style={styles.info}>{bloc.formattedAmount}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Exchange Rate</Text>
        <Text style={styles.info}>{bloc.formattedInfoExchangeRate}</Text>
      </View>
      <Spacer height={20} />

      {bloc.calculatedOrder.calculatedItems.map(renderCalculatedOrderItem)}

      <View style={styles.line} />
      <Spacer height={20} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{screenModeTotalTitle}</Text>
        <Text style={styles.infoBigger}>{screenModeTotalAmount}</Text>
      </View>

      <Spacer height={24} />
      <Spacer height={-1} />

      <Button
        title={screenModeButtonText}
        loading={bloc.loading}
        disabled={bloc.total <= 0 || bloc.loading}
        onPress={onBankTransfer}
      />
      <Spacer height={24} />
    </SafeAreaView>
  )
})

const renderCalculatedOrderItem = item => (
  <View key={item.value}>
    <View key={item.code} style={styles.infoRow}>
      <Text style={styles.infoLabel}>{item.label}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.info}>{item.valueFormatted}</Text>
      </View>
    </View>
    <Spacer height={20} />
  </View>
)

const Edges: Edge[] = ['bottom']

const EditIconSrc = require('../../../assets/images/edit-v2.icon.svg')

const renderTransactionTypeTitle = {
  [ScreenMode.Sell]: 'Withdrawal',
  [ScreenMode.Buy]: 'Deposit',
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  amountColumn: {
    marginLeft: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    ...fonts.numbersM,
    lineHeight: 64,
    color: colors.text,
  },
  exchangeRate: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  editBtnWrapper: {
    marginTop: 20,
    height: 24,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  infoContainer: {
    flexDirection: 'row',
  },
  info: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  infoExtra: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  infoBigger: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  infoLeftText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  transactionTypeText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    backgroundColor: colors.accent,
    color: colors.input,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: 'hidden',
    borderRadius: 16,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
})
