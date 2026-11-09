import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { Spacer } from '../../../../component/spacer'
import { TimerV2 } from '../../../../component/timer-v2'
import { Lottery } from '../../../../models'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'

type JackpotBannerPropsType = {
  lottery: Lottery
}

export const JackpotBanner = observer<JackpotBannerPropsType>(({ lottery }) => {
  const { description, nextDraw } = lottery

  const formattedAmount = formatCurrency(nextDraw.grandPrizeUsdc, CurrencyCode.USD, false)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{description}</Text>
      <Spacer height={8} />

      <Text style={styles.amount}>{formattedAmount}</Text>
      <Spacer height={8} />

      <TimerV2 prefix={'Time to next giveaway:'} endTS={new Date(nextDraw.drawAt)} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    maxWidth: 280,
  },
  title: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  mainText: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  amount: {
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.accent,
  },
  infoWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.background3,
  },
  infoTextRow: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.textLight,
  },
})
