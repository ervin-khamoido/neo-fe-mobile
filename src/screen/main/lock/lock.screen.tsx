import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'
import { OutlineButton, UtilityButton } from '../../../component/button-v2'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { fonts } from '../../../common/typefaceV2'
import { CurrencyCode, sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import { LockBLoC } from './lock.bloc'
import { Spacer, VSpacer } from '../../../component/spacer'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'
import { Lock } from '../../../models'
import { JackpotBanner } from './components/jackpot-banner'
import { formatCurrency } from '../../../lib/utils/helpers'
import { ActivityItem } from '../tabs/components/activity-item'

export const LockOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',

  ...DefaultScreenOptions,
}

export const LockScreen = observer(props => {
  const bloc = ioc.useBLoC(LockBLoC, props)

  const onCreateNewLock = useCallback(() => bloc.onCreateNewLock(), [bloc])
  const onAddFunds = useCallback(uid => bloc.onAddFunds(uid), [bloc])
  const onWithdraw = useCallback(uid => bloc.onWithdraw(uid), [bloc])
  const onActivityPress = useCallback(uid => bloc.onActivityPress(uid), [bloc])

  const renderActiveLockItem = (item: Lock) => (
    <View style={styles.row} key={item.uid}>
      <View key={item.uid} style={styles.lockContainer}>
        <Text style={styles.activeLockTitle}>Dream Lock</Text>
        <Spacer height={24} />

        <Text style={styles.activeLockAmount}>{formatCurrency(item.balance, CurrencyCode.USD, false)}</Text>
        <Text style={styles.activeLockTitle}>Dream points: {bloc.lottery.totalTickets}</Text>
        <Spacer height={24} />

        <View style={styles.row}>
          <UtilityButton
            style={styles.activeLockAddFundsBtn}
            textStyle={styles.activeLockAddFundsBtnText}
            title="Add Funds"
            indicatorColor={colors.background}
            onPress={onAddFunds(item.uid)}
          />
          <VSpacer width={8} />

          <UtilityButton
            style={styles.activeLockWithdrawFundsBtn}
            title="Withdraw Early"
            onPress={onWithdraw(item.uid)}
          />
        </View>
        <Spacer height={24} />

        <Text style={styles.activeLockExpiresInText}>{bloc.expiresIn(item.expiresAt)}</Text>
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.list}>
      <SafeAreaView style={styles.container} edges={Edges}>
        <Text style={styles.title}>Neobank App Saturday</Text>
        <Spacer height={24} />

        {bloc.lottery?.nextDraw && (
          <>
            <View style={styles.row}>
              <JackpotBanner lottery={bloc.lottery} />
            </View>

            <Spacer height={24} />
          </>
        )}

        {bloc.locks.length < 1 && (
          <View style={styles.row}>
            <OutlineButton
              style={styles.btnAction}
              textStyle={styles.btnTitleStyle}
              title="Create Dream Lock"
              onPress={onCreateNewLock}
              indicatorColor={colors.accent}
            >
              <VectorImage style={styles.plusIcon} width={24} height={24} source={PlusIconSrc} />
              <VSpacer width={12} />
            </OutlineButton>
            <VSpacer width={8} />
          </View>
        )}
        <Spacer height={8} />

        {bloc.locks.map(renderActiveLockItem)}
        <Spacer height={24} />

        <View style={styles.activityTableHeadersRow}>
          <Text style={styles.activityTableTitle}>Activity</Text>
        </View>
        <Spacer height={8} />

        <View style={styles.line} />
        <Spacer height={8} />

        {bloc.activities.map(x => (
          <ActivityItem key={x.uid} item={x} onPress={onActivityPress} />
        ))}
        <Spacer height={16} />
      </SafeAreaView>
    </ScrollView>
  )
})

const PlusIconSrc = require('../../../../assets/images/plus.icon.svg')
const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldTitle: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  title: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.gray3,
  },
  amount: {
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.accent,
  },
  timerWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    maxWidth: 280,
  },
  btnAction: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 23,
    justifyContent: 'flex-start',
    borderRadius: 20,
    borderColor: colors.gray3,
  },
  btnTitleStyle: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.gray3,
  },
  plusIcon: {
    tintColor: colors.gray3,
  },
  activityTableTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  activityTableHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lockContainer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxWidth: 327,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray7,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  activeLockTitle: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 16,
    color: colors.textSecondary4,
  },
  activeLockAddFundsBtn: {
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  activeLockAddFundsBtnText: {
    color: colors.textLight,
  },
  activeLockWithdrawFundsBtn: {
    paddingHorizontal: 16,
  },
  activeLockExpiresInText: {
    textAlign: 'center',
    ...fonts.h6Regular,
    lineHeight: 16,
    color: colors.textSecondary5,
  },
  activeLockAmount: {
    textAlign: 'center',
    ...fonts.numbersXS,
    lineHeight: 32,
    color: colors.text,
  },
})
