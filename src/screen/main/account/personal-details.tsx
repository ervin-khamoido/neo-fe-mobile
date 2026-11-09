import React from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors as colorsV2 } from '../../../common/colorV2'

import { Spacer } from '../../../component/spacer'
import { fonts as fontsV2 } from '../../../common/typefaceV2'

import { PersonalDetailsBloc } from './personal-details.bloc'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'
import { formatUsername } from '../../../utils/helpers'

export const PersonalDetailsOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',

  ...DefaultScreenOptions,
}

export const PersonalDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(PersonalDetailsBloc, props)

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.title}>Personal Details</Text>
      <Spacer height={40} />

      {!!bloc.name && (
        <>
          <Text style={styles.detailTitle}>Name</Text>
          <Text style={styles.detailInfo}>{bloc.name}</Text>
          <Spacer height={20} />
        </>
      )}

      {!!bloc.email && (
        <>
          <Text style={styles.detailTitle}>Email</Text>
          <Text style={styles.detailInfo}>{bloc.email}</Text>
          <Spacer height={20} />
        </>
      )}

      {!!bloc.phoneNumber && (
        <>
          <Text style={styles.detailTitle}>Phone Number</Text>
          <Text style={styles.detailInfo}>{bloc.phoneNumber}</Text>
          <Spacer height={20} />
        </>
      )}

      {!!bloc.address && (
        <>
          <Text style={styles.detailTitle}>Address</Text>
          <Text style={styles.detailInfo}>{bloc.address}</Text>
          <Spacer height={20} />
        </>
      )}

      {!!bloc.username && (
        <>
          <Text style={styles.detailTitle}>{formatUsername('NeobankTag')}</Text>
          <Text style={styles.detailInfo}>{bloc.username}</Text>
        </>
      )}
    </SafeAreaView>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colorsV2.background,
    paddingHorizontal: sizes.marginV2,
  },
  title: {
    ...fontsV2.h1Regular,
    color: colorsV2.text,
  },
  detailTitle: {
    ...fontsV2.h6Regular,
    color: colorsV2.textLabel,
  },
  detailInfo: {
    ...fontsV2.h2Regular,
    lineHeight: 32,
    color: colorsV2.text,
  },
})
