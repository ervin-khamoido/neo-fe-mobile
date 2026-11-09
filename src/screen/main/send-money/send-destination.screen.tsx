import React, { useCallback, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, StyleProp, ImageStyle } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'
import { Spacer, VSpacer } from '../../../component/spacer'
import { SendDestinationBLoC } from './send-destination.bloc'

export const SendDestinationScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: '',
}

export const SendDestinationScreen = observer(props => {
  const bloc = ioc.useBLoC(SendDestinationBLoC, props)

  const onSend = useCallback(() => bloc.onSend(), [bloc])
  const onSendNoop = useCallback(() => {}, [])
  const onSendByCryptoAddress = useCallback(() => bloc.onSendByCryptoAddress(), [bloc])
  const onSendOnChainApply = useCallback(() => bloc.onSendOnChainApply(), [bloc])
  const onSendToUsBankAccount = useCallback(() => bloc.onSendToUsBankAccount(), [bloc])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where do you want to send money?</Text>
      <Spacer height={40} />

      <View style={styles.line} />
      <DestinationOption
        title="To Neobank App User"
        iconSize={24}
        iconSrc={UserIconSrc}
        iconStyles={styles.userIcon}
        onPress={onSend}
      />
      {!bloc.sendOnChainFeature?.isFeatureEnabled ? (
        <DestinationOption
          title={'To Crypto Address\n(Coming Soon)'}
          iconSize={24}
          iconSrc={RewardCoinIconSrc}
          onPress={onSendNoop}
          disabled
        />
      ) : bloc.sendOnChainFeature?.showWaitlist ? (
        <DestinationOption
          title={
            bloc.sendOnChainFeature?.isUserInWaitlist
              ? 'To Crypto Address\n(Applied for Early Access)'
              : 'To Crypto Address\n(Get Early Access)'
          }
          iconSize={24}
          iconSrc={RewardCoinIconSrc}
          onPress={onSendOnChainApply}
          disabled={!!bloc.sendOnChainFeature?.isUserInWaitlist}
        />
      ) : (
        <DestinationOption
          title={'To Crypto Address'}
          iconSize={24}
          iconSrc={RewardCoinIconSrc}
          onPress={onSendByCryptoAddress}
        />
      )}

      <DestinationOption
        title="To US Bank Account"
        iconSize={24}
        iconSrc={DollarIconSrc}
        onPress={onSendToUsBankAccount}
        disabled={!bloc.showSendUsBankAccountBtn}
      />
      <Spacer height={20} />
    </View>
  )
})

const UserIconSrc = require('../../../../assets/images/user-v2.icon.svg')
const DollarIconSrc = require('../../../../assets/images/dollar-sign.icon.svg')
const RewardCoinIconSrc = require('../../../../assets/images/reward-coin.icon.svg')
const ChevronRightIconSrc = require('../../../../assets/images/chevron-right.icon.svg')

type DestinationOptionProps = {
  title: string
  iconSize: number
  iconSrc: number
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  iconStyles?: StyleProp<ImageStyle>
}

const DestinationOption = observer<DestinationOptionProps>(props => {
  const { title, iconSize, iconSrc, onPress, disabled, loading, iconStyles } = props

  const iStyles = useMemo(
    () =>
      StyleSheet.flatten([
        disabled ? styles.disabledIcon : styles.icon,
        { width: iconSize, height: iconSize },
        iconStyles,
      ]),
    [disabled, iconStyles, iconSize],
  )

  const textStyles = useMemo(
    () => StyleSheet.flatten(disabled ? styles.optionsDisabledText : styles.optionsText),
    [disabled],
  )

  const iChevronStyles = useMemo(() => [disabled ? styles.disabledIcon : {}, { width: 20, height: 20 }], [disabled])

  return (
    <>
      <TouchableOpacity onPress={onPress} disabled={disabled}>
        <View style={styles.optionContainer}>
          <View style={styles.iconOptionContainer}>
            <VectorImage style={iStyles} width={iconSize} height={iconSize} source={iconSrc} />
            <VSpacer width={16} />
            <Text style={textStyles}>{title}</Text>
          </View>
          <View style={styles.rightOptionContainer}>
            <VSpacer width={8} />
            {!!loading && <ActivityIndicator size="small" />}
            <VSpacer width={8} />
            <VectorImage width={20} height={20} source={ChevronRightIconSrc} style={iChevronStyles} />
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.line} />
    </>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  title: {
    ...fonts.h1SemiBold,
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
  optionsDisabledText: {
    ...fonts.h4PreSemiBold,
    color: colors.textDisabled,
  },
  icon: {
    tintColor: colors.accent,
  },
  disabledIcon: {
    tintColor: colors.textDisabled,
  },
  rightOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userIcon: {
    tintColor: colors.accent,
  },
})
