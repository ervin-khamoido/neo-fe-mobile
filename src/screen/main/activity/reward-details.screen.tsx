import React, { memo } from 'react'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { ScrollView, StyleSheet } from 'react-native'

import ioc from '../../../ioc'
import { RewardType } from '../../../models'
import { TransactionsActivityTitle } from './common'
import { colors } from '../../../common/constrants'

import { RewardDetailsBLoC } from './reward-details.bloc'

import { DefaultRewardDetailsWidget } from './widget/default-reward-details.widget'
import { CashbackRewardDetailsWidget } from './widget/cashback-reward-details.widget'
import { ReferralRewardDetailsWidget } from './widget/referral-reward-details.widget'

export const RewardDetailsScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: TransactionsActivityTitle,
}

export const RewardDetailsScreen = memo(props => {
  const bloc = ioc.useBLoC(RewardDetailsBLoC, props)

  const renderWidget = () => {
    switch (bloc.rewardType) {
      case RewardType.Referral_Referrer:
        return <ReferralRewardDetailsWidget uids={bloc.uids} />
      case RewardType.Cashback_Buy:
        return <CashbackRewardDetailsWidget uids={bloc.uids} />
      default:
        return <DefaultRewardDetailsWidget uids={bloc.uids} />
    }
  }

  return <Observer>{() => <ScrollView style={styles.list}>{renderWidget()}</ScrollView>}</Observer>
})

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
})
