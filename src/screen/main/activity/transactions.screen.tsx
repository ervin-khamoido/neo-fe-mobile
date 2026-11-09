import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import ioc from '../../../ioc'
import { Activity } from '../../../models'
import { colors, sizes } from '../../../common/constrants'

import { ActivityItem } from '../tabs/components/activity-item'
import { EmptyList } from '../tabs/components/empty-list'
import { EncourageReferralActivityCard } from '../tabs/components/encourage-referral-activity-card'

import { TransactionsBLoC } from './transactions.bloc'
import { Spacer } from '../../../component/spacer'

const keyExtractor = (item: Activity) => item.uid

export const TransactionsScreen = observer(props => {
  const bloc = ioc.useBLoC(TransactionsBLoC, props)
  const onDetailPress = useCallback(item => bloc.onDetailPress(item), [bloc])
  const onReferPress = useCallback(() => bloc.onReferPress(), [bloc])

  const renderItem: ListRenderItem<Activity> = ({ item }) => <ActivityItem item={item} onPress={onDetailPress} />

  return (
    <View style={styles.container}>
      {bloc.shortReferralRewardInfo && (
        <>
          <Spacer height={24} />
          <View style={styles.referContainer}>
            <EncourageReferralActivityCard
              onReferPress={onReferPress}
              shortReferralRewardInfo={bloc.shortReferralRewardInfo}
            />
          </View>
          <Spacer height={16} />
        </>
      )}

      {bloc.activity.length ? (
        <FlatList<Activity>
          keyExtractor={keyExtractor}
          data={bloc.activity}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <EmptyList />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: sizes.marginV2,
  },
  referContainer: {
    paddingHorizontal: sizes.marginV2,
  },
})
