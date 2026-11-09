import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import ioc from '../../../ioc'

import { Spacer, VSpacer } from '../../../component/spacer'
import { fonts } from '../../../common/typefaceV2'
import { UtilityButton } from '../../../component/button-v2'
import { colors } from '../../../common/colorV2'
import { ActivityItem } from '../tabs/components/activity-item'
import { sizes } from '../../../common/constrants'
import { StackNavigationOptions } from '@react-navigation/stack'
import { LockDetailsBloc } from './lock-details.bloc'

export const LockDetailsScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const LockDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(LockDetailsBloc, props)

  const onAddFunds = useCallback(() => bloc.onAddFunds(), [bloc])
  const onWithdrawEarly = useCallback(() => bloc.onWithdrawEarly(), [bloc])
  const onActivityPress = useCallback(uid => bloc.onActivityPress(uid), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{bloc.data?.name ?? 'Lock'}</Text>
      <Spacer height={16} />

      <View style={styles.row}>
        <Text style={styles.amount}>{bloc.formattedAmount}</Text>
      </View>
      <Spacer height={40} />

      {!bloc.isExpired && (
        <>
          <View style={styles.btnRow}>
            <UtilityButton
              style={styles.transactionAddCashBtn}
              textStyle={styles.transactionAddCashBtnText}
              title="Add Funds"
              loading={bloc.addFundsLoading}
              indicatorColor={colors.background}
              onPress={onAddFunds}
            />
            <VSpacer width={8} />

            <UtilityButton
              style={styles.transactionBtn}
              title="Withdraw Early"
              loading={bloc.withdrawEarlyLoading}
              onPress={onWithdrawEarly}
            />
          </View>
          <Spacer height={24} />
        </>
      )}

      {bloc.isExpired ? (
        <Text style={styles.expiresInText}>{bloc.expiredAt}</Text>
      ) : (
        <Text style={styles.expiresInText}>{bloc.expiresIn}</Text>
      )}

      <Spacer height={40} />

      <View style={styles.activityTableHeadersRow}>
        <Text style={styles.activityTableTitle}>Activity</Text>
      </View>
      <Spacer height={8} />

      <View style={styles.line} />
      <Spacer height={8} />

      {bloc.activities.map(x => (
        <ActivityItem key={x.uid} item={x} onPress={onActivityPress} />
      ))}
    </ScrollView>
  )
})

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 16,
    color: colors.text,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activityTableTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  activityTableHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityTableBtn: {
    ...fonts.h6PreSemiBold,
    color: colors.text,
  },
  transactionAddCashBtn: {
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  transactionAddCashBtnText: {
    color: colors.textLight,
  },
  transactionBtn: {
    paddingHorizontal: 16,
  },
  amount: {
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.text,
  },
  subAmountText: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  expiresInText: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 16,
    color: colors.textLabel,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
})
