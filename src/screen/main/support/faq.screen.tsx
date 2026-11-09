import React, { useCallback } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import { FAQBLoC } from './faq.bloc'
import { Collapsible } from '../component/collapsible'
import { SearchInput } from '../../../component/form/search-input'
import { Spacer } from '../../../component/spacer'
import { fonts } from '../../../common/typefaceV2'

export const FAQScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const FAQScreen = observer(props => {
  const bloc = ioc.useBLoC(FAQBLoC, props)

  const onSearchChange = useCallback((_, title) => bloc.onSearchChange(title), [bloc])

  return (
    <View style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Spacer height={40} />

        <SearchInput name="search" value={bloc.search} onChange={onSearchChange} />
      </View>
      <Spacer height={40} />

      <Collapsible sections={bloc.sections} />
    </View>
  )
})

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
  },
  title: {
    ...fonts.h1Bold,
    color: colors.text,
  },
})
