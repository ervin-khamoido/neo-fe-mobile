import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import VectorImage from 'react-native-vector-image'

import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../../component/spacer'

interface IBannerProps {
  text: string
  onPress: () => void
}

export const RewardBanner = memo<IBannerProps>(({ onPress, text }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.label}>Rewards</Text>
      <Text style={styles.mainText}>{text}</Text>

      <Spacer height={20} />

      <View style={styles.line} />
      <Spacer height={20} />

      <View style={styles.btn}>
        <Text style={styles.btnText}>View Rewards</Text>
        <VSpacer width={16} />
        <VectorImage style={styles.arrowBtn} width={6} height={12} source={ArrowIcon} />
      </View>

      <VectorImage style={styles.bannerBg} source={RewardsBgIcon} />
    </TouchableOpacity>
  )
})

const ArrowIcon = require('../../../../../assets/images/backspace.icon.svg')
const RewardsBgIcon = require('../../../../../assets/images/rewards-card-bg.icon.svg')

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: 327,
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
  label: {
    ...fonts.h5Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  mainText: {
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
    width: 128,
    height: 128,
    position: 'absolute',
    right: -7,
    bottom: -9,
  },
  amount: {
    ...fonts.numbersXS,
    lineHeight: 32,
    color: colors.accent,
  },
})
