import React, { memo, useMemo, useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import VectorImage from 'react-native-vector-image'

import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../../component/spacer'
import { Lottery } from '../../../../models'
import { Button } from '../../../../component/button-v2'
import { CurrencyCode } from '../../../../common/constrants'
import { TimerV2 } from '../../../../component/timer-v2'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { SwipeButtonREA } from '../../../../component/swipe-button-rea'

interface IBannerProps {
  data: Lottery
  lockLoading: boolean
  lotteryPending: boolean

  onPress: () => void

  showLotteryWinner: boolean
  onWinnerReveal: () => void
}

export const LotteryBanner = memo<IBannerProps>(
  ({ onPress, onWinnerReveal, data, lotteryPending, lockLoading, showLotteryWinner }) => {
    const bannerBgStyles = useMemo(
      () => StyleSheet.flatten([styles.bannerBg, data?.nextDraw ? { top: 0 } : { bottom: -15 }]),
      [data?.nextDraw],
    )
    const boldTextStyles = useMemo(
      () => StyleSheet.flatten([styles.boldText, data?.nextDraw ? ({ width: '70%' } as any) : {}]),
      [data?.nextDraw],
    )

    const amount = data?.nextDraw ? data?.nextDraw?.grandPrizeUsdc : data?.maxGrandPriceUsdc
    const formattedAmount = formatCurrency(amount, CurrencyCode.USD, false)

    const renderLoader = () => (
      <View style={styles.loaderWrapper}>
        <ActivityIndicator size={'large'} />
      </View>
    )

    const renderWinnerBannerBody = () => (
      <>
        <Text style={styles.lotteryName}>{data?.name}</Text>
        <Spacer height={16} />

        <Text style={styles.grandPrizeLabel}>See if you won</Text>
        <Spacer height={24} />

        <SwipeButtonREA name="revealWinner" value={false} label="Swipe to Reveal" onChange={onWinnerReveal} />
      </>
    )

    const renderBannerBody = () => (
      <>
        <Text style={styles.label}>{data?.name}</Text>
        <Text style={boldTextStyles}>{data?.description}</Text>

        <Spacer height={16} />
        <Text style={styles.amount}>{formattedAmount}</Text>

        {data?.nextDraw && (
          <>
            <Text style={styles.boldText}>Your Dream points: {data?.totalTickets}</Text>
            <Spacer height={24} />

            <Button
              title="Save to win"
              loading={lockLoading}
              disabled={lockLoading}
              onPress={onPress}
              indicatorColor={colors.accent}
            />
            <Spacer height={24} />

            <TimerV2 endTS={new Date(data.nextDraw.drawAt)} />
          </>
        )}

        {!data?.nextDraw && (
          <>
            <Spacer height={20} />

            <View style={styles.line} />
            <Spacer height={20} />

            <View style={styles.btn}>
              <Text style={styles.btnText}>Learn More</Text>
              <VSpacer width={16} />
              <VectorImage style={styles.arrowBtn} width={6} height={12} source={ArrowIcon} />
              <VSpacer width={16} />
              {lockLoading && <ActivityIndicator />}
            </View>
          </>
        )}

        <VectorImage style={bannerBgStyles} source={ShieldIconSrc} />
      </>
    )

    const lotteryDrawWinnerStyle = useMemo(
      () => [styles.container, showLotteryWinner ? styles.greenContainer : null],
      [showLotteryWinner],
    )

    return (
      <TouchableOpacity style={lotteryDrawWinnerStyle} disabled={showLotteryWinner} onPress={onPress}>
        {showLotteryWinner ? renderWinnerBannerBody() : lotteryPending ? renderLoader() : renderBannerBody()}
      </TouchableOpacity>
    )
  },
)

const ArrowIcon = require('../../../../../assets/images/backspace.icon.svg')
const ShieldIconSrc = require('../../../../../assets/images/shield-v2.icon.svg')

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 327,
    // minHeight: 200,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gray7,
    backgroundColor: colors.background,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 4,
  },
  greenContainer: {
    backgroundColor: colors.accent,
  },
  loaderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...fonts.h5Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  boldText: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnText: {
    ...fonts.h5SemiBold,
    lineHeight: 24,
    color: colors.text,
  },
  arrowBtn: {
    tintColor: colors.accent,
    transform: [{ rotateZ: '180deg' }],
    width: 6,
    height: 12,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bannerBg: {
    width: 158,
    height: 158,
    position: 'absolute',
    right: -15,
  },
  amount: {
    ...fonts.numbersXS,
    lineHeight: 32,
    color: colors.accent,
  },

  // winner banner
  lotteryName: {
    ...fonts.h5Regular,
    color: colors.background,
    textAlign: 'center',
  },
  grandPrizeLabel: {
    ...fonts.h1SemiBold,
    color: colors.background,
    textAlign: 'center',
  },
})
