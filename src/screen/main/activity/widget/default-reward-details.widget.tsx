import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { Image, StyleSheet, Text, View } from 'react-native'
import LottieView from 'lottie-react-native'

import ioc from '../../../../ioc'
import { fonts } from '../../../../common/typeface'
import { colors, sizes } from '../../../../common/constrants'

import { Spacer } from '../../../../component/spacer'

import { DefaultDetailsWidgetBLoC } from './default-reward-details.bloc'
import { Button } from '../../../../component/button'
import VectorImage from 'react-native-vector-image'

export type DefaultDetailsProps = {
  uids: string[]

  onClose?: () => void
}
export const DefaultRewardDetailsWidget = observer<DefaultDetailsProps>(props => {
  const bloc = ioc.useBLoC(DefaultDetailsWidgetBLoC, props)

  const onShare = useCallback(() => bloc.onShare(), [bloc])

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

      <Button style={styles.btn} title=" Share With Your Friends" onPress={onShare}>
        <VectorImage style={styles.shareIcon} width={24} height={24} source={ShareIconSrc} />
      </Button>
      <Spacer height={24} />

      {/* This view is converted to an image when you share it. It's hidden on UI */}
      <View style={styles.imageContainer} ref={bloc.shareImageRef}>
        <Spacer height={32} />

        <VectorImage style={styles.neobankBlackWordLogo} width={66} height={18} source={NeobankBlackWordLogoSrc} />
        <Spacer height={25} />

        <Image style={styles.celebrationImage} source={RewardImage} resizeMode={'contain'} />
        <Spacer height={10} />

        <Text style={styles.addedText}>Yay!</Text>
        <Spacer height={8} />

        <Text style={styles.infoText}>{bloc.description}</Text>
        <Spacer height={5} />

        <Text style={styles.dateText}>{bloc.completedAt}</Text>
        <Spacer height={22} />

        <Text style={styles.winAmount}>+{bloc.displayAmountUsdc}</Text>
        <Text style={styles.winAmountNaira}>+{bloc.displayAmount}</Text>
      </View>
      <Spacer height={24} />
      {/* End view component  */}
    </View>
  )
})

const RewardAnimationSrc = require('../../../../../assets/animations/cashback_transaction_details.json')
const ShareIconSrc = require('../../../../../assets/images/share.icon.svg')
const NeobankBlackWordLogoSrc = require('../../../../../assets/images/neobank-black-word-logo-v2.icon.svg')
const RewardImage = require('../../../../../assets/images/party-pop-vertical.png')

const ContainerSize = 500
const ImageSize = ContainerSize * 0.2

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: sizes.marginV2,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    ...fonts.h5Regular,
    color: colors.text,
  },
  infoText: {
    ...fonts.h4SemiBold,
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

  lottie: {
    width: 140,
    height: 140,
  },
  btn: {
    alignSelf: 'stretch',
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
  winAmountNaira: {
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
