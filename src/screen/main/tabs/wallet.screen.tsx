import React, { useCallback, useMemo } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../component/spacer'
import { CanCreateModal } from './components/can-create-modal'
import { SimpleModal } from '../../../component/modals/simple-modal'
import { ActivityItem } from './components/activity-item'
import { UtilityButton } from '../../../component/button-v2'

import { ActivePaymentWidget } from './widget/active-payment.widget'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'

import { WalletBLoC } from './wallet.bloc'
import { RewardBanner } from './components/reward-banner'
import { Switch } from '../component/switcher'
import { LotteryBanner } from './components/lottery-banner'

export const WalletTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color }) => (
    <VectorImage style={{ tintColor: color, width: 24, height: 24 }} width={24} height={24} source={TabIconSrc} />
  ),
  tabBarLabel: 'Home',
}

export const WalletScreen = observer(props => {
  const bloc = ioc.useBLoC(WalletBLoC, props)

  const onCashOut = useCallback(() => bloc.onCashOut(), [bloc])
  const onAddCash = useCallback(() => bloc.onAddCash(), [bloc])
  const onDetailPress = useCallback(item => bloc.onDetailPress(item), [bloc])
  const onLock = useCallback(() => bloc.onLockPage(), [bloc])

  const onToggleCurrency = useCallback(() => bloc.onToggleCurrency(), [bloc])
  const onToggleCannotBuyModal = useCallback(() => bloc.onToggleCannotBuyModal(), [bloc])
  const onToggleCannotSellModal = useCallback(() => bloc.onToggleCannotSellModal(), [bloc])
  const modalBtn = useMemo(() => ({ title: 'Okay', onPress: () => bloc.onToggleZeroBalanceModal() }), [bloc])

  const onReferPress = useCallback(() => bloc.onReferPress(), [bloc])
  const onNeobankAppSaturdayPress = useCallback(() => bloc.onNeobankAppSaturdayPress(), [bloc])
  const onActivityPage = useCallback(() => bloc.onActivityPage(), [bloc])

  const onWinnerReveal = useCallback(() => bloc.onWinnerReveal(), [bloc])

  return (
    <ScrollView
      style={styles.list}
      contentContainerStyle={bloc.hasActivePayment ? styles.containerPadded : styles.container}
    >
      <Spacer height={24} />

      <ActivePaymentWidget />
      <Spacer height={24} />

      {/*<View style={styles.row}>*/}
      {/*  <Switch handleToggle={onToggleCurrency} switched={bloc.currencyToggle} />*/}
      {/*</View>*/}
      {/*<Spacer height={16} />*/}

      <View style={styles.row}>
        <Text style={[styles.balance, { ...fonts[bloc.numberFontSize] }]}>{bloc.formattedBalance}</Text>
        {bloc.loading && <ActivityIndicator style={styles.balanceLoading} size={'large'} />}
      </View>
      <Spacer height={24} />

      <View style={styles.transactionBtnRow}>
        <UtilityButton
          style={styles.transactionAddCashBtn}
          textStyle={styles.transactionAddCashBtnText}
          title="Add Cash"
          loading={bloc.addCashLoading}
          indicatorColor={colors.background}
          onPress={onAddCash}
        />
        <VSpacer width={8} />

        {bloc.showLockBtn && (
          <>
            <UtilityButton
              style={styles.lockBtn}
              title=""
              onPress={onLock}
              loading={bloc.lockLoading}
              disabled={bloc.lockLoading}
            >
              <VectorImage style={styles.lockIcon} width={20} height={20} source={LockIconSrc} />
            </UtilityButton>
            <VSpacer width={8} />
          </>
        )}

        <UtilityButton
          style={styles.transactionBtn}
          title="Cash Out"
          loading={bloc.cashOutLoading}
          onPress={onCashOut}
        />
      </View>
      <Spacer height={40} />

      {bloc.showNeobankAppSaturdayBanner && (
        <>
          <View style={styles.rewardsCardContainer}>
            <LotteryBanner
              data={bloc.lottery}
              lockLoading={bloc.lockLoading}
              lotteryPending={bloc.lotteryPending}
              onPress={onNeobankAppSaturdayPress}
              //
              showLotteryWinner={bloc.showLotteryWinner}
              onWinnerReveal={onWinnerReveal}
            />
          </View>
          <Spacer height={25} />
        </>
      )}

      {bloc.showRewardCenter && (
        <>
          <View style={styles.rewardsCardContainer}>
            <RewardBanner text={bloc.rewardBannerText} onPress={onReferPress} />
          </View>
          <Spacer height={80} />
        </>
      )}

      <View style={styles.activityTableHeadersRow}>
        <Text style={styles.activityTableTitle}>Activity</Text>
        <TouchableOpacity onPress={onActivityPage}>
          <Text style={styles.activityTableBtn}>View All</Text>
        </TouchableOpacity>
      </View>
      <Spacer height={8} />

      <View style={styles.line} />
      <Spacer height={8} />

      {bloc.activity.map(x => (
        <ActivityItem key={x.uid} item={x} onPress={onDetailPress} />
      ))}

      <SimpleModal
        visible={bloc.showZeroBalanceModal}
        header="Your wallet is empty"
        body="You need to add money to your wallet before you can withdraw."
        button={modalBtn}
      />
      <ModalMonitor isVisible={bloc.showZeroBalanceModal} hostComponentName="Wallet Screen" modalName="Empty Balance" />

      <CanCreateModal type={'Buy'} visible={bloc.showCannotBuyModal} onToggle={onToggleCannotBuyModal} />
      <ModalMonitor
        isVisible={bloc.showCannotBuyModal}
        hostComponentName="Wallet Screen"
        modalName="Can't Create Buy Order"
      />

      <CanCreateModal type={'Sell'} visible={bloc.showCannotSellModal} onToggle={onToggleCannotSellModal} />
      <ModalMonitor
        isVisible={bloc.showCannotSellModal}
        hostComponentName="Wallet Screen"
        modalName="Can't Create Sell Order"
      />
    </ScrollView>
  )
})

const TabIconSrc = require('../../../../assets/images/home.icon.svg')
const LockIconSrc = require('../../../../assets/images/lock-v2.icon.svg')

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  containerPadded: {
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
    paddingBottom: 80,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionBtnRow: {
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
    width: 104,
    backgroundColor: colors.accent,
  },
  transactionAddCashBtnText: {
    color: colors.textLight,
  },
  transactionBtn: {
    width: 104,
  },
  lockBtn: {
    paddingHorizontal: 14,
  },
  lockIcon: {
    tintColor: colors.primary,
    width: 20,
    height: 20,
  },
  refreshIcon: {
    tintColor: colors.primary,
  },
  balance: {
    color: colors.text,
    height: 64, // must have a fixed height
    textAlignVertical: 'center',
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceLabel: {
    ...fonts.h4Regular,
    lineHeight: 16,
    color: colors.text,
  },
  balanceLoading: {
    position: 'absolute',
    right: 0,
    top: 16,
  },
  rewardsCardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
})
