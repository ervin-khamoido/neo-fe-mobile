import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import VectorImage from 'react-native-vector-image'
import LottieView from 'lottie-react-native'

import ioc from '../../../../ioc'
import { fonts } from '../../../../common/typeface'
import { colors, sizes } from '../../../../common/constrants'

import { Button } from '../../../../component/button'
import { Spacer } from '../../../../component/spacer'

import { ReferralRewardDetailsWidgetBLoC } from './referral-reward-details.bloc'

export type RewardDetailsProps = {
  uids: string[]

  onClose?: () => void
}
export const ReferralRewardDetailsWidget = observer<RewardDetailsProps>(props => {
  const bloc = ioc.useBLoC(ReferralRewardDetailsWidgetBLoC, props)

  const onReferMore = useCallback(() => bloc.onReferMore(), [bloc])

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

      <Button style={styles.btn} title=" Refer More Friends" onPress={onReferMore}>
        <VectorImage style={styles.shareIcon} width={24} height={24} source={ShareIconSrc} />
      </Button>
      <Spacer height={16} />

      <Text style={styles.bottomMessageContainer}>Refer more friends to win more bonuses.</Text>
      <Spacer height={24} />
    </View>
  )
})

const ShareIconSrc = require('../../../../../assets/images/share.icon.svg')
const RewardAnimationSrc = require('../../../../../assets/animations/cashback_transaction_details.json')

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
  bottomMessageContainer: {
    ...fonts.h4Regular,
    color: '#00000099',
    width: '80%',
    textAlign: 'center',
  },

  lottie: {
    width: 140,
    height: 140,
  },
  btn: {
    alignSelf: 'stretch',
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
})
