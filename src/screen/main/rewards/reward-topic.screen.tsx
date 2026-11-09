import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { ActivityIndicator, ListRenderItem, StyleSheet, Text, View, VirtualizedList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { StackNavigationOptions } from '@react-navigation/stack'
import { fonts } from '../../../common/typefaceV2'
import { Spacer } from '../../../component/spacer'
import { ActivityItem } from '../tabs/components/activity-item'
import { RewardsTopicBLoC } from './reward-topic.bloc'
import { Activity } from '../../../models'
import { EmptyList } from '../tabs/components/empty-list'

export const RewardTopicOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}
export const RewardTopicScreen = observer(props => {
  const bloc = ioc.useBLoC(RewardsTopicBLoC, props)

  const onDetailPress = useCallback(item => bloc.onDetailPress(item), [bloc])
  const loadActivities = useCallback(() => bloc.loadActivities(), [bloc])
  const syncLastActivities = useCallback(() => bloc.syncLastActivities(), [bloc])

  const renderItem: ListRenderItem<Activity> = ({ item }) => (
    <ActivityItem key={item.uid} item={item} onPress={onDetailPress} />
  )
  const renderFooter = () => bloc.loading && <ActivityIndicator size="large" color={colors.accent} />

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={Edges}>
      <View style={styles.container}>
        <Text style={styles.title}>{bloc.title}</Text>
        <Spacer height={40} />

        <View style={styles.badge}>
          <Text style={styles.badgeTitle}>{bloc.badgeTitle}</Text>
          <Text style={styles.badgeAmount}>{bloc.totalEarned}</Text>
          <Spacer height={12} />

          <View style={styles.monthAmountBadge}>
            <Text style={styles.monthAmountBadgeTitle}>{bloc.badgeMonthAmountTitle}</Text>
            <Text style={styles.monthAmountBadgeAmount}>+{bloc.totalEarnedCurrentMonth}</Text>
          </View>
        </View>
        <Spacer height={40} />

        <View style={styles.activityTableHeadersRow}>
          <Text style={styles.activityTableTitle}>Activity</Text>
        </View>
        <Spacer height={8} />

        <View style={styles.line} />
      </View>

      {bloc.activity.length ? (
        <VirtualizedList<Activity>
          onRefresh={syncLastActivities}
          refreshing={bloc.syncListLoading}
          data={bloc.activity}
          extraData={bloc.loading}
          getItemCount={getItemCount}
          getItem={getItem}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReachedThreshold={0.1}
          onEndReached={loadActivities}
          ListFooterComponent={renderFooter}
          style={styles.listContainer}
        />
      ) : (
        <EmptyList />
      )}
    </SafeAreaView>
  )
})

const Edges = ['top', 'bottom'] as any

const keyExtractor = (item: Activity) => item.uid
const getItemCount = (data: Activity[]) => data.length
const getItem = (data: Activity[], index: number) => data[index]

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    marginTop: -20,
    paddingHorizontal: sizes.marginV2,
    flex: 1,
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

  activityTableTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  activityTableHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityTableBtn: {
    ...fonts.h6PreSemiBold,
    color: colors.text,
  },

  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
})
