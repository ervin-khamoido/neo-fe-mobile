import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'

import { RewardsCenterBLoC } from './rewards-center.bloc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { StackNavigationOptions } from '@react-navigation/stack'
import { fonts } from '../../../common/typefaceV2'
import { Spacer, VSpacer } from '../../../component/spacer'
import { ActivityType, RewardModeType, RewardType } from '../../../models'

export const RewardsCenterOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}
export const RewardsCenterScreen = observer(props => {
  const bloc = ioc.useBLoC(RewardsCenterBLoC, props)

  const onTopic = useCallback((mode: RewardModeType) => () => bloc.onTopic(mode), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView edges={Edges}>
        <Text style={styles.title}>Rewards</Text>
        <Spacer height={40} />

        <View style={styles.badge}>
          <Text style={styles.badgeTitle}>Total Rewards Earned</Text>
          <Text style={styles.badgeAmount}>{bloc.totalEarned}</Text>
          <Spacer height={12} />

          <View style={styles.monthAmountBadge}>
            <Text style={styles.monthAmountBadgeTitle}>Earned in {bloc.currentMonth}</Text>
            <Text style={styles.monthAmountBadgeAmount}>+{bloc.totalEarnedInCurrentMonthAmount}</Text>
          </View>
        </View>
        <Spacer height={40} />

        <View style={styles.line} />
        <Spacer height={20} />

        <RewardOption
          title="Interest Earned"
          amount={bloc.totalEarnedAmountByTopic(ActivityType.Yield)}
          onPress={onTopic(ActivityType.Yield)}
          iconSrc={PercentIcon}
        />
        <RewardOption
          title="Cash Back"
          amount={bloc.totalEarnedAmountByTopic(RewardType.Cashback_Buy)}
          onPress={onTopic(RewardType.Cashback_Buy)}
          iconSrc={DollarIcon}
        />
        <RewardOption
          title="Referrals"
          amount={bloc.totalEarnedAmountByTopic(RewardType.Referral_Referrer)}
          onPress={onTopic(RewardType.Referral_Referrer)}
          iconSrc={UserPlusIcon}
        />
        <RewardOption
          title="Neobank App Saturdays"
          amount={bloc.totalEarnedAmountByTopic(RewardType.Promotion_Campaign)}
          onPress={onTopic(RewardType.Promotion_Campaign)}
          iconSrc={AwardIcon}
        />
        <Spacer height={24} />
      </SafeAreaView>
    </ScrollView>
  )
})

type RewardOptionProps = {
  title: string
  amount: string
  iconSize?: number
  iconSrc: number
  onPress: () => void
}

const RewardOption = observer<RewardOptionProps>(({ title, iconSize = 24, iconSrc, onPress, amount }) => {
  return (
    <>
      <TouchableOpacity style={styles.rewardOptionHeader} onPress={onPress}>
        <View style={styles.messageIconWrapper}>
          <VectorImage width={iconSize} height={iconSize} source={iconSrc} />
        </View>
        <VSpacer width={12} />

        <View style={styles.row}>
          <View style={styles.textWrapper}>
            <Text style={styles.rewardOptionTitle}>{title}</Text>
            <Text style={styles.rewardOptionInfo}>+{amount}</Text>
          </View>

          <VectorImage width={24} height={24} source={ChevronRightIcon} />
        </View>
      </TouchableOpacity>

      <Spacer height={20} />
      <View style={styles.line} />
      <Spacer height={20} />
    </>
  )
})

const ChevronRightIcon = require('../../../../assets/images/chevron-right.icon.svg')
const PercentIcon = require('../../../../assets/images/percent.icon.svg')
const DollarIcon = require('../../../../assets/images/dollar-sign-accent.icon.svg')
const UserPlusIcon = require('../../../../assets/images/user-plus.icon.svg')
const AwardIcon = require('../../../../assets/images/award.icon.svg')

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...fonts.h1Regular,
    color: colors.text,
  },
  upperAmountLabel: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  amount: {
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.text,
  },
  underAmountLabel: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },

  rewardOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageIconWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardOptionTitle: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  rewardOptionInfo: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  textWrapper: {
    flex: 1,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },

  badge: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray5,
    borderRadius: 24,
  },
  badgeTitle: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  badgeAmount: {
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.text,
  },
  monthAmountBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: colors.background3,
  },
  monthAmountBadgeTitle: {
    ...fonts.h5Regular,
    lineHeight: 20,
    color: colors.textLight,
  },
  monthAmountBadgeAmount: {
    ...fonts.h5Bold,
    lineHeight: 20,
    color: colors.textLight,
  },
})
