import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, View, Image } from 'react-native'
import VectorImage from 'react-native-vector-image'
import LottieView from 'lottie-react-native'

import ioc from '../../../../ioc'
import { fonts } from '../../../../common/typeface'
import { colors, sizes } from '../../../../common/constrants'

import { Button } from '../../../../component/button'
import { Spacer } from '../../../../component/spacer'

import { CashbackDetailsWidgetBLoC } from './cashback-reward-details.bloc'

export type CashbackDetailsProps = {
  uids: string[]

  onClose?: () => void
}
export const CashbackRewardDetailsWidget = observer<CashbackDetailsProps>(props => {
  const bloc = ioc.useBLoC(CashbackDetailsWidgetBLoC, props)

  const onCashbackShare = useCallback(() => bloc.onShare(), [bloc])

  return (
    <View style={styles.container}>
      <Spacer height={32} />
      <LottieView style={styles.lottie} source={RewardAnimationSrc} loop={true} autoPlay={true} />
      <Spacer height={16} />

      <Text style={styles.titleText}>Congratulations</Text>
      <Spacer height={8} />

      <Text style={styles.infoText}>{bloc.description}</Text>
      <Spacer height={6} />

      <Text style={styles.dateText}>{bloc.completedAt}</Text>
      <Spacer height={16} />

      <Text style={styles.purchaseAmountUSD}>{bloc.displayAmountUsdc}</Text>
      <Text style={styles.exchangeAmountNaira}>{bloc.displayAmount}</Text>
      <Spacer height={40} />

      <Button style={styles.btn} title=" Share With Your Friends" onPress={onCashbackShare}>
        <VectorImage style={styles.shareIcon} width={24} height={24} source={ShareIconSrc} />
      </Button>
      <Spacer height={16} />

      <Text style={styles.bottomMessageContainer}>
        {bloc.isReferralRewardActive &&
          `And get a referral bonus after they deposit at least ${bloc.minRefereeSaveAmountUsdcFormatted}. `}
        Keep saving to keep winning!
      </Text>

      {/* This view is converted to an image when you share it. It's hidden on UI */}
      <View style={styles.imageContainer} ref={bloc.shareImageRef}>
        <Spacer height={32} />

        <VectorImage style={styles.neobankBlackWordLogo} width={66} height={18} source={NeobankBlackWordLogoSrc} />
        <Spacer height={25} />

        <Image style={styles.celebrationImage} source={RewardImage} resizeMode={'contain'} />
        <Spacer height={10} />

        <Text style={styles.addedText}>Yay!</Text>
        <Spacer height={8} />

        <Text style={styles.infoText}>I just won a cashback bonus when I saved with Neobank</Text>
        <Spacer height={5} />

        <Text style={styles.dateText}>{bloc.completedAt}</Text>
        <Spacer height={22} />

        <Text style={styles.winAmount}>+{bloc.displayAmountUsdc}</Text>
        <Text style={styles.percentageWin}>
          {bloc.cashbackPercentage} of {bloc.cashbackAmountSaved}
        </Text>
      </View>
      <Spacer height={24} />

      {/* End view component  */}
    </View>
  )
})

const ShareIconSrc = require('../../../../../assets/images/share.icon.svg')
const RewardAnimationSrc = require('../../../../../assets/animations/cashback_transaction_details.json')
const NeobankBlackWordLogoSrc = require('../../../../../assets/images/neobank-black-word-logo-v2.icon.svg')
const RewardImage = require('../../../../../assets/images/party-pop-vertical.png')

const ContainerSize = 400
const ImageSize = ContainerSize * 0.2

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
    alignItems: 'center',
  },
  text: {
    ...fonts.h5Regular,
    color: colors.text,
  },
  infoText: {
    ...fonts.h4Regular,
    color: colors.text,
    paddingHorizontal: 25,
    textAlign: 'center',
  },
  dateText: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  titleText: {
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
  bottomMessageContainer: {
    ...fonts.h4Regular,
    color: '#00000099',
    textAlign: 'center',
    width: '80%',
  },

  lottie: {
    width: 140,
    height: 140,
  },
  btn: {
    alignSelf: 'stretch',
  },

  // ---
  centerContent: {
    alignItems: 'center',
    textAlign: 'center',
  },
  addedText: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  imageContainer: {
    backgroundColor: colors.background,
    width: ContainerSize,
    height: ContainerSize,
    position: 'absolute',
    right: -ContainerSize - 5, // - width - 5
    alignItems: 'center',
  },
  celebrationImage: {
    width: ImageSize,
    height: ImageSize,
  },
  winAmount: {
    ...fonts.numbersS,
    color: colors.primary,
  },
  percentageWin: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
  neobankBlackWordLogo: {
    width: 66,
    height: 18,
  },
})
