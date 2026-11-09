import React, { memo, useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../../ioc'

import { UserSearchOutput } from '../../../../models/output/user-search.output'
import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'

import { Spacer, VSpacer } from '../../../../component/spacer'
import { fonts } from '../../../../common/typefaceV2'
import { SearchInput } from '../../../../component/form/search-input'

import { SendRecipientBLoC } from './send-recipient.bloc'
import { formatUsername } from '../../../../utils/helpers'

export const SendRecipientScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: 'Recipient',
}

export const SendRecipientScreen = observer(props => {
  const bloc = ioc.useBLoC(SendRecipientBLoC, props)

  const onSearchChange = useCallback((_, value) => bloc.onSearchChange(value), [bloc])
  const onItemPress = useCallback(x => bloc.onItemPress(x), [bloc])

  const renderItem: ListRenderItem<UserSearchOutput> = ({ item }) => <UserItem {...item} onPress={onItemPress} />
  const renderEmpty = () =>
    bloc.loading ? null : (
      <Text style={styles.emptyList}>
        {!bloc.canStartSearch
          ? 'Start typing to search...'
          : `Hmmm... We couldn't find any matches for "${bloc.search}"`}
      </Text>
    )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Who would you like to transfer <Text style={styles.emphasize}>{bloc.displayAmountUsdc}</Text> to?
      </Text>
      <Spacer height={40} />

      <SearchInput
        name="search"
        inputStyle={styles.search}
        value={bloc.search}
        placeholder={`Mobile #, Email, ${formatUsername('NeobankTag')}, Wallet Addr.`}
        loading={bloc.loading}
        onChange={onSearchChange}
        returnKeyType="done"
      />
      <Spacer height={24} />

      <FlatList<UserSearchOutput>
        style={styles.userList}
        contentContainerStyle={styles.userListContainer}
        data={bloc.users}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        //
      />
    </View>
  )
})

const keyExtractor = (item: UserSearchOutput) => item.uid

type UserItemProps = {
  onPress?: (uid: string) => void
} & UserSearchOutput
const UserItem = memo<UserItemProps>(props => {
  const { uid, displayName, username, onPress } = props

  const onItemPress = useCallback(() => onPress?.(uid), [onPress, uid])

  return displayName.trim().length ? (
    <TouchableOpacity style={styles.userItem} onPress={onItemPress}>
      <View style={styles.profilePhoto}>
        <Text style={styles.profileLetter}>{displayName[0].toUpperCase()}</Text>
      </View>

      <VSpacer width={12} />

      <View style={styles.namesBlock}>
        <Text style={styles.fullName}>{displayName}</Text>
        {username && <Text style={styles.username}>${username}</Text>}
      </View>
    </TouchableOpacity>
  ) : null
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  search: {
    ...fonts.h2Regular,
    color: colors.text,
    lineHeight: undefined,
  },
  userList: {
    marginHorizontal: -sizes.marginV2,
    backgroundColor: colors.background,
  },
  userListContainer: {
    paddingTop: 6,
    paddingBottom: 46,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  emptyList: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 100,
  },
  profileLetter: {
    ...fonts.h3Bold,
    color: colors.textLight,
  },
  namesBlock: {
    flex: 1,
    flexDirection: 'column',
  },
  fullName: {
    ...fonts.h4PreSemiBold,
    color: colors.text,
  },
  username: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
  },
  emphasize: {
    color: colors.accent,
  },
})
