import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../../ioc'

import { fonts } from '../../../../common/typefaceV2'
import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'

import { Spacer, VSpacer } from '../../../../component/spacer'

import { SendOnChainConfirmBLoC } from './send-on-chain-confirm.bloc'
import { Button } from '../../../../component/button-v2'
import { OnChainNetworkIcon, OnChainNetworkTitle, OnChainTokenIcon, OnChainTokenTitle } from '../../activity/common'
import { ConfirmationModal } from './component/confirmation.modal'

export const SendOnChainConfirmScreenOptions = ({ route }) => {
  const { headerShown = true } = route.params ?? {}

  return {
    headerShown: headerShown,
    title: '',
  } as StackNavigationOptions
}

export const SendOnChainConfirmScreen = observer(props => {
  const bloc = ioc.useBLoC(SendOnChainConfirmBLoC, props)

  const onEdit = useCallback(() => bloc.onEdit(), [bloc])
  const onOnChainTransfer = useCallback(() => bloc.onOnChainTransfer(), [bloc])
  const onConfirmModal = useCallback(() => bloc.onConfirmModal(), [bloc])
  const onCancelModal = useCallback(() => bloc.onCancelModal(), [bloc])
  const onToggleCheckBoxOne = useCallback(() => bloc.onToggleCheckBoxOne(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.list} edges={Edges}>
        <Text style={styles.title}>Confirm transfer to external wallet</Text>
        <Spacer height={40} />

        <View style={styles.amountWrapper}>
          <View style={styles.amountColumn}>
            <Text style={styles.amount}>{bloc.displayAmount}</Text>
            <Text style={styles.exchangeRate}>{bloc.displayNairaExchangeRate}</Text>
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
          <Text style={styles.transactionTypeText}>Transfer</Text>
        </View>
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>To</Text>
          <Text style={styles.info}>{bloc.formattedToAddress}</Text>
        </View>
        <Spacer height={20} />

        {/* TODO */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount to be Sent</Text>
          <View style={styles.infoRightTextContainer}>
            <VectorImage width={24} height={24} source={OnChainTokenIcon[bloc.coin]} />
            <VSpacer width={4} />
            <Text style={styles.info}>{bloc.displayAmountWithoutCurrency}</Text>
            <VSpacer width={4} />
            <Text style={styles.info}>{OnChainTokenTitle[bloc.coin]}</Text>
          </View>
        </View>
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Network</Text>
          <View style={styles.infoRightTextContainer}>
            <VectorImage style={styles.tokenIcon} width={24} height={24} source={OnChainNetworkIcon[bloc.baseCoin]} />
            <VSpacer width={4} />
            <Text style={styles.info}>{OnChainNetworkTitle[bloc.baseCoin]}</Text>
          </View>
        </View>
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount</Text>
          <Text style={styles.info}>{bloc.displayAmount}</Text>
        </View>
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Neobank Fees</Text>
          <Text style={styles.info}>{bloc.displayNeobankFeesUsdc}</Text>
        </View>
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Network Fees</Text>
          <Text style={styles.info}>{bloc.displayNetworkFeesUsdc}</Text>
        </View>
        <Spacer height={20} />

        <View style={styles.line} />
        <Spacer height={20} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Deducted From Wallet</Text>
          <Text style={styles.infoBold}>{bloc.displayTotalUsdc}</Text>
        </View>

        <Spacer height={24} />
        <Spacer height={-1} />

        <Button title="Transfer" loading={bloc.loading} disabled={bloc.loading} onPress={onOnChainTransfer} />
        <Spacer height={24} />

        <ConfirmationModal
          onConfirmModal={onConfirmModal}
          showConfirmationModal={bloc.showConfirmationModal}
          loading={bloc.loading}
          onCancelModal={onCancelModal}
          onToggleCheckBoxOne={onToggleCheckBoxOne}
          toggleCheckBox={bloc.toggleCheckBox}
        />
      </SafeAreaView>
    </ScrollView>
  )
})
const EditIconSrc = require('../../../../../assets/images/edit-v2.icon.svg')

const Edges = ['bottom'] as any

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
  title: {
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
  editIcon: {
    tintColor: colors.accent,
    width: 24,
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
  infoRightTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  infoBold: {
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
  tokenIcon: {
    width: 24,
    height: 24,
  },
})
