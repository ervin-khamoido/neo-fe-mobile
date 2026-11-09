import React, { memo, useCallback } from 'react'
import { StyleSheet, FlatList, ListRenderItem, View } from 'react-native'
import { Observer } from 'mobx-react-lite'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'

import { PendingBLoC } from './pending.bloc'
import { Activity } from '../../../models'
import { EmptyList } from './components/empty-list'
import { ActivityItem } from './components/activity-item'

const keyExtractor = (item: Activity) => item.uid

export const PendingScreen = memo(props => {
  const bloc = ioc.useBLoC(PendingBLoC, props)
  const onDetailPress = useCallback(item => bloc.onDetailPress(item), [bloc])

  const renderItem: ListRenderItem<Activity> = ({ item }) => (
    <ActivityItem item={item} loading={bloc.loadingItem === item.uid} onPress={onDetailPress} />
  )

  return (
    <Observer>
      {() => (
        <View style={styles.container}>
          {bloc.activity.length ? (
            <FlatList<Activity>
              data={bloc.activity}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              extraData={bloc.loadingItem}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <EmptyList />
          )}
        </View>
      )}
    </Observer>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContainer: {
    paddingVertical: sizes.activityListInset,
    paddingHorizontal: sizes.marginV2,
  },
})
