import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'

import ioc from '../../../../ioc'

import { UnreadBadgeBLoC } from './unread-badge.bloc'
import { colors } from '../../../../common/constrants'
import { fonts } from '../../../../common/typeface'
import { ActivityStore } from '../../../../services/store/activity.store'

type KeyOfActivityStore<Keys extends keyof ActivityStore> = Keys

export type UnreadBadgeProps = {
  activityKey: KeyOfActivityStore<'history' | 'pending'>
}
export const UnreadBadgeWidget = memo<UnreadBadgeProps>(props => {
  const bloc = ioc.useBLoC(UnreadBadgeBLoC, props)

  return (
    <Observer>
      {() =>
        bloc.unread ? (
          <View style={styles.container}>
            <Text style={styles.badgeText}>{bloc.unread}</Text>
          </View>
        ) : (
          <></>
        )
      }
    </Observer>
  )
})

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginRight: 7,
    alignSelf: 'center',
    width: 29,
    height: 29,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
  },
  badgeText: {
    ...fonts.h5Bold,
    color: colors.input,
    textAlign: 'center',
  },
})
