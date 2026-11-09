import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors as colorsV2 } from '../../../common/colorV2'
import { fonts as fontsV2 } from '../../../common/typefaceV2'

import { HelpCenterBLoC } from './help-center.bloc'
import { Spacer } from '../../../component/spacer'
import { Collapsible } from '../component/collapsible'

export const HelpCenterScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const HelpCenterScreen = observer(props => {
  const bloc = ioc.useBLoC(HelpCenterBLoC, props)

  const onViewAll = useCallback(() => bloc.onFAQ(), [bloc])
  const onChat = useCallback(() => bloc.onChat(), [bloc])

  return (
    <View style={styles.container}>
      <View style={styles.contactSupportWrapper}>
        <Text style={styles.title}>Support</Text>
        <Spacer height={40} />
      </View>

      <Collapsible
        sections={bloc.firstSection}
        showHeader
        showSectionHeader={false}
        onViewAll={onViewAll}
        showChatSection
        onChat={onChat}
        hasUnreadFreshchat={bloc.hasUnreadFreshchat}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsV2.background,
  },
  title: {
    ...fontsV2.h1Bold,
    color: colorsV2.text,
    paddingHorizontal: sizes.marginV2,
  },

  contactSupportWrapper: {
    position: 'relative',
  },
  contactSupport: {
    alignSelf: 'flex-end',
  },
})
