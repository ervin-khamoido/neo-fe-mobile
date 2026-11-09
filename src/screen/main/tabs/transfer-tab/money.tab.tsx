import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, StyleProp, ImageStyle } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../../ioc'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { Spacer, VSpacer } from '../../../../component/spacer'

import { MoneyBLoC } from './money.bloc'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { sizes } from '../../../../common/constrants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CanCreateModal } from '../components/can-create-modal'
import { ModalMonitor } from '../../../../widget/modal-monitor.widget'

export const MoneyTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color }) => <VectorImage style={{ tintColor: color }} width={24} height={24} source={DollarIconSrc} />,
  tabBarLabel: 'Money',
  headerShown: false,
}

export const MoneyTab = observer(props => {
  const bloc = ioc.useBLoC(MoneyBLoC, props)

  const onAddCash = useCallback(() => bloc.onAddCash(), [bloc])
  const onReceive = useCallback(() => bloc.onReceive(), [bloc])
  const onSend = useCallback(() => bloc.onSend(), [bloc])
  const onCashOut = useCallback(() => bloc.onCashOut(), [bloc])
  const onPay = useCallback(() => bloc.onPay(), [bloc])
  const onRequest = useCallback(() => bloc.onRequest(), [bloc])
  const onRewardsCenter = useCallback(() => bloc.onRewardsCenter(), [bloc])
  const onToggleCannotBuyModal = useCallback(() => bloc.onToggleCannotBuyModal(), [bloc])
  const onToggleCannotSellModal = useCallback(() => bloc.onToggleCannotSellModal(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Spacer height={36} />
      <Text style={styles.title}>Money</Text>
      <Spacer height={40} />

      <View style={styles.line} />
      <MoneyOption
        title="Add Cash"
        iconSize={24}
        iconSrc={PlusIconSrc}
        loading={bloc.addCashLoading}
        disabled={bloc.addCashLoading}
        onPress={onAddCash}
      />
      <MoneyOption title="Receive" iconSize={24} iconSrc={ArrowIconSrc} onPress={onReceive} />
      <MoneyOption title="Send" iconSize={24} iconSrc={ArrowIconSrc} onPress={onSend} iconStyles={styles.sendIcon} />
      {/* TODO */}
      {/* <MoneyOption title="Pay" iconSize={24} iconSrc={DollarIconSrc} onPress={onPay} />
        <MoneyOption title="Request" iconSize={24} iconSrc={MessageSquareIconSrc} onPress={onRequest} />*/}
      <MoneyOption
        title="Cash Out"
        iconSize={24}
        iconSrc={MinusSquareIconSrc}
        onPress={onCashOut}
        disabled={bloc.cashOutLoading}
        loading={bloc.cashOutLoading}
      />
      <MoneyOption title="Rewards" iconSize={24} iconSrc={RewardCoinIconSrc} onPress={onRewardsCenter} />
      <Spacer height={20} />

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
    </SafeAreaView>
  )
})

const PlusIconSrc = require('../../../../../assets/images/plus.icon.svg')
const ArrowIconSrc = require('../../../../../assets/images/arrow-down-v2.icon.svg')
const DollarIconSrc = require('../../../../../assets/images/dollar-sign.icon.svg')
const MessageSquareIconSrc = require('../../../../../assets/images/message-square.icon.svg')
const MinusSquareIconSrc = require('../../../../../assets/images/minus.icon.svg')
const RewardCoinIconSrc = require('../../../../../assets/images/reward-coin.icon.svg')
const ChevronRightIconSrc = require('../../../../../assets/images/chevron-right.icon.svg')

type MoneyOptionProps = {
  title: string
  iconSize: number
  iconSrc: number
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  iconStyles?: StyleProp<ImageStyle>
}
const MoneyOption = observer<MoneyOptionProps>(props => {
  const { title, iconSize, iconSrc, onPress, disabled, loading, iconStyles } = props

  const iStyles = useMemo(
    () => [styles.icon, { width: iconSize, height: iconSize }, iconStyles],
    [iconStyles, iconSize],
  )

  return (
    <>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <View style={styles.optionContainer}>
          <View style={styles.iconOptionContainer}>
            <VectorImage style={iStyles} width={iconSize} height={iconSize} source={iconSrc} />
            <VSpacer width={16} />
            <Text style={styles.optionsText}>{title}</Text>
          </View>
          <View style={styles.rightOptionContainer}>
            <VSpacer width={8} />
            {!!loading && <ActivityIndicator size="small" />}
            <VSpacer width={8} />
            <VectorImage width={20} height={20} source={ChevronRightIconSrc} />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.line} />
    </>
  )
})

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  title: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    alignItems: 'center',
  },
  iconOptionContainer: {
    flexDirection: 'row',
  },
  optionsText: {
    ...fonts.h4PreSemiBold,
    color: colors.text,
  },
  icon: {
    tintColor: colors.accent,
  },
  rightOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  sendIcon: {
    transform: [{ rotateZ: '-180deg' }],
  },
})
