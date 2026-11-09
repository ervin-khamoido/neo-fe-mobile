import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typeface'

import { ContactSupportBLoC } from './contact-support.bloc'
import { Spacer, VSpacer } from '../../../component/spacer'

export const ContactSupportScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Contact Support',
}

export const ContactSupportScreen = observer(props => {
  const bloc = ioc.useBLoC(ContactSupportBLoC, props)

  const onChatSupport = useCallback(() => bloc.onChatSupport(), [bloc])
  const onEmailSupport = useCallback(() => bloc.onEmailSupport(), [bloc])

  return (
    <View style={styles.container}>
      <Spacer height={60} />
      <VectorImage style={styles.supportIcon} source={SupportIcon} height={96} width={96} />

      <Text style={styles.title}>How can we help you?</Text>
      <Spacer height={60} />

      <View style={styles.row}>
        <TouchableOpacity style={styles.contactOption} onPress={onChatSupport}>
          <View style={styles.chatIconWrapper}>
            <VectorImage style={styles.icon} source={ChatIcon} height={36} width={36} />
            {!!bloc.hasUnreadFreshchat && <View style={styles.unreadBadge} />}
          </View>
          <Spacer height={8} />
          {bloc.supportInAppChatEnabled ? (
            <Text style={styles.contactOptionText}>Live Chat</Text>
          ) : (
            <Text style={styles.contactOptionText}>Coming Soon</Text>
          )}
        </TouchableOpacity>

        <VSpacer width={24} />

        <TouchableOpacity style={styles.contactOption} onPress={onEmailSupport}>
          <VectorImage style={styles.icon} source={EmailIcon} height={36} width={36} />

          <Spacer height={8} />
          <Text style={styles.contactOptionText}>Email</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
})

const SupportIcon = require('../../../../assets/images/support.icon.svg')
const EmailIcon = require('../../../../assets/images/email.icon.svg')
const ChatIcon = require('../../../../assets/images/chat.icon.svg')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
    alignItems: 'center',
  },
  title: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },

  row: {
    flexDirection: 'row',
  },

  icon: {
    tintColor: colors.accent,
    width: 36,
    height: 36,
  },
  contactOption: {
    backgroundColor: colors.utilityBackground,
    borderRadius: 999,
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactOptionText: {
    ...fonts.h4Regular,
    color: colors.text,
  },

  chatIconWrapper: {
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: colors.danger2,
    borderRadius: 16,
    top: -4,
    right: -4,
  },

  supportIcon: {
    height: 96,
    width: 96,
  },
})
