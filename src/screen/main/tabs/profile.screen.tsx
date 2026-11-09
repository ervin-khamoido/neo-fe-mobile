import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors as colorsV2 } from '../../../common/colorV2'
import { fonts as fontsV2 } from '../../../common/typefaceV2'
import { Spacer, VSpacer } from '../../../component/spacer'

import { ProfileBLoC } from './profile.bloc'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'

const ProfileIconSrc = require('../../../../assets/images/profile.icon.svg')

export const ProfileScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: '',

  ...DefaultScreenOptions,
}

export const ProfileScreen = observer(props => {
  const bloc = ioc.useBLoC(ProfileBLoC, props)

  const onLogout = useCallback(() => bloc.onLogout(), [bloc])
  const onDeleteAccount = useCallback(() => bloc.onDeleteAccount(), [bloc])
  const onAccountDetails = useCallback(() => bloc.onAccountDetails(), [bloc])
  const onBuildInfo = useCallback(() => bloc.onBuildInfo(), [bloc])
  const onSecurity = useCallback(() => bloc.onSecurity(), [bloc])
  const onPrivacy = useCallback(() => bloc.onPrivacy(), [bloc])
  const onUsername = useCallback(() => bloc.onUsername(), [bloc])
  const onPersonalDetails = useCallback(() => bloc.onPersonalDetails(), [bloc])
  const onSupport = useCallback(() => bloc.onSupport(), [bloc])
  const onInvite = useCallback(() => bloc.onInvite(), [bloc])
  const onSavedBankAccounts = useCallback(() => bloc.onSavedBankAccounts(), [bloc])

  const nameStyles = useMemo(() => [styles.name, { ...fontsV2[bloc.fontSize] }], [bloc.fontSize])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
      <SafeAreaView style={styles.container} edges={Edges}>
        {/*<View style={styles.avatarRow}>
          <AvatarWidget size={80} editable />
        </View>*/}

        <Pressable onPress={onBuildInfo}>
          {!!bloc.name && (
            <>
              {bloc.name.length > 15 && <Spacer height={16} />}
              <Text style={nameStyles}>{bloc.name}</Text>
            </>
          )}
          {!!bloc.username && <Text style={styles.subtext}>${bloc.username}</Text>}
        </Pressable>
        <Spacer height={40} />

        <TouchableOpacity style={styles.referralBlock} onPress={onInvite}>
          <VectorImage style={styles.giftIcon} width={24} height={24} source={GiftIconSrc} />
          <VSpacer width={12} />

          <View style={styles.descriptionWrapper}>
            <Text style={styles.referralTitle}>{bloc.referralTitle}</Text>
            <Text style={styles.referralRegular}>{bloc.referralDescription}</Text>
          </View>
        </TouchableOpacity>
        <Spacer height={40} />

        {!bloc.username && (
          <ProfileOption title="Create Username" iconSize={24} iconSrc={ProfileIconSrc} onPress={onUsername} />
        )}
        <ProfileOption title="Personal Details" iconSize={24} iconSrc={UserIconSrc} onPress={onPersonalDetails} />
        <ProfileOption title="Account Details" iconSize={24} iconSrc={DollarSignIconSrc} onPress={onAccountDetails} />
        <ProfileOption
          title="Saved Payment Methods"
          iconSize={24}
          iconSrc={BankIconSrc}
          onPress={onSavedBankAccounts}
          loading={bloc.bankAccountsLoading}
        />
        <ProfileOption title="Privacy Policy" iconSize={24} iconSrc={CheckmarkIconSrc} onPress={onPrivacy} />

        {bloc.isAppLockEnabled && (
          <ProfileOption title="Security" iconSize={24} iconSrc={SecurityV2IconSrc} onPress={onSecurity} />
        )}

        <ProfileOption
          title="Support"
          iconSize={24}
          iconSrc={MessageIconSrc}
          onPress={onSupport}
          disabled={bloc.helpCenterLoading}
        />
        <ProfileOption title="Delete Neobank Account" iconSize={24} iconSrc={DeleteIconSrc} onPress={onDeleteAccount} />
        <ProfileOption title="Logout" iconSize={24} iconSrc={LogoutIconSrc} onPress={onLogout} />
        <Spacer height={20} />
      </SafeAreaView>
    </ScrollView>
  )
})

const LogoutIconSrc = require('../../../../assets/images/logout.icon.svg')
const DeleteIconSrc = require('../../../../assets/images/delete.icon.svg')
const DollarSignIconSrc = require('../../../../assets/images/dollar-sign.icon.svg')
const GiftIconSrc = require('../../../../assets/images/gift.icon.svg')
const UserIconSrc = require('../../../../assets/images/user.icon.svg')
const SecurityV2IconSrc = require('../../../../assets/images/security-v2.icon.svg')
const MessageIconSrc = require('../../../../assets/images/message-circle.icon.svg')
const BankIconSrc = require('../../../../assets/images/bank.icon.svg')
const ChevronRightIconSrc = require('../../../../assets/images/chevron-right.icon.svg')
const CheckmarkIconSrc = require('../../../../assets/images/checkmark-v2.icon.svg')

type ProfileOptionProps = {
  title: string
  iconSize: number
  iconSrc: number
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  unreadBadge?: boolean
}
const ProfileOption = memo<ProfileOptionProps>(props => {
  const { title, iconSize, iconSrc, onPress, disabled, loading, unreadBadge } = props

  const iconStyle = useMemo(() => [styles.icon, { width: iconSize, height: iconSize }], [iconSize])

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View style={styles.optionContainer}>
        <View style={styles.iconOptionContainer}>
          <VectorImage style={iconStyle} width={iconSize} height={iconSize} source={iconSrc} />
          <VSpacer width={16} />
          <Text style={styles.optionsText}>{title}</Text>
        </View>
        <View style={styles.rightOptionContainer}>
          {!!unreadBadge && <View style={styles.unreadBadge} />}
          <VSpacer width={8} />
          {!!loading && <ActivityIndicator size="small" />}
          <VSpacer width={8} />
          <VectorImage style={styles.chevronRightIcon} width={20} height={20} source={ChevronRightIconSrc} />
        </View>
      </View>
    </TouchableOpacity>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colorsV2.background,
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: colorsV2.background,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colorsV2.background,
    paddingHorizontal: sizes.marginV2,
  },
  referralBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colorsV2.background,
    borderRadius: 20,
    shadowColor: colorsV2.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 5,
  },
  descriptionWrapper: {
    flex: 1,
  },
  referralTitle: {
    ...fontsV2.h3SemiBold,
    color: colorsV2.text,
    flex: 0,
  },
  referralRegular: {
    ...fontsV2.h6Regular,
    color: colorsV2.text,
    textAlign: 'left',
    flex: 0,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    alignItems: 'center',
  },
  iconOptionContainer: {
    flexDirection: 'row',
  },
  optionsText: {
    ...fontsV2.h4PreSemiBold,
    color: colorsV2.text,
  },
  icon: {
    tintColor: colorsV2.accent,
  },
  name: {
    textAlign: 'center',
    color: colorsV2.text,
  },
  subtext: {
    ...fontsV2.h4Regular,
    lineHeight: 24,
    textAlign: 'center',
    color: colorsV2.textLabel,
  },
  unreadBadge: {
    width: 16,
    height: 16,
    backgroundColor: colorsV2.danger2,
    borderRadius: 16,
    top: 0,
    left: 0,
  },
  rightOptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevronRightIcon: {
    width: 20,
    height: 20,
  },
  giftIcon: {
    width: 24,
    height: 24,
  },
})
