import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { CardOrderActivityStatus } from '../../../models'
import { fonts } from '../../../common/typeface'
import { fonts as fontsV2 } from '../../../common/typefaceV2'
import { colors, sizes } from '../../../common/constrants'
import { colors as colorsV2 } from '../../../common/colorV2'

import { OutlineButton } from '../../../component/button'
import { Spacer, VSpacer } from '../../../component/spacer'

import { CardActivityDetailsBLoC } from './card-activity-detail.bloc'
import { CardTransactionInfo } from './component/card-transaction-info'
import { CircleActivityIndicator } from '../../../component/circle-activity-indicator'

export const CardActivityDetailScreenOptions = ({ route }) => {
  const { headerShown = true } = route.params ?? {}

  return {
    headerShown: headerShown,
    title: '',
  } as StackNavigationOptions
}

export const CardActivityDetailScreen = observer(props => {
  const bloc = ioc.useBLoC(CardActivityDetailsBLoC, props)

  const onSupport = useCallback(() => bloc.onSupport(), [bloc])
  const onBackToCard = useCallback(() => bloc.onBackToCard(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.list} edges={Edges}>
        <View style={styles.row}>
          <View style={styles.imageCircle}>{activityTransactionIcon[bloc.activity.status]}</View>
        </View>
        <Spacer height={24} />

        <Text style={styles.transactionTitle}>{bloc.activityTitle}</Text>
        <Text style={styles.transactionDateText}>{bloc.transactionDate}</Text>
        <Spacer height={24} />

        <View style={styles.row}>
          <Text style={styles.amountUsd}>{bloc.displayUSDAmount}</Text>
        </View>
        <Spacer height={64} />

        <CardTransactionInfo item={bloc.activity} />
        <Spacer height={24} />

        <Spacer height={-1} />

        <TouchableOpacity style={styles.contactSupportBtn} onPress={onSupport}>
          <VectorImage style={styles.infoIcon} width={24} height={24} source={InfoIconSrc} />
          <VSpacer width={8} />
          <Text style={styles.contactSupportBtnText}>Contact Support</Text>
        </TouchableOpacity>
        <Spacer height={24} />

        <OutlineButton title="Back to Card" onPress={onBackToCard} />
        <Spacer height={24} />
      </SafeAreaView>
    </ScrollView>
  )
})

const InfoIconSrc = require('../../../../assets/images/info-bold.icon.svg')
const CheckmarkIconSrc = require('../../../../assets/images/checkmark-v2.icon.svg')
const UnsuccessfulIconSrc = require('../../../../assets/images/exclamation-point-circle-small-yellow.icon.svg')

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: sizes.marginV2,
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  imageCircle: {
    padding: 24,
    borderRadius: 100,
    backgroundColor: colorsV2.borderLight4,
  },
  transactionTitle: {
    ...fontsV2.h1SemiBold,
    textAlign: 'center',
    color: colors.text,
  },
  transactionDateText: {
    ...fontsV2.h4Regular,
    lineHeight: 24,
    textAlign: 'center',
    color: colorsV2.textLabel,
  },
  amountUsd: {
    ...fonts.numbersS,
    color: colors.text,
  },
  contactSupportBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactSupportBtnText: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },

  box: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...fonts.h1SemiBold,
    color: colors.text,
    textAlign: 'center',
    width: '80%',
  },
  infoIcon: {
    width: 24,
    height: 24,
  },

  activityTransactionIcon: {
    width: 40,
    height: 40,
  },
})

const activityTransactionIcon = {
  [CardOrderActivityStatus.Completed]: (
    <VectorImage style={styles.activityTransactionIcon} width={40} height={40} source={CheckmarkIconSrc} />
  ),
  [CardOrderActivityStatus.Failed]: (
    <VectorImage style={styles.activityTransactionIcon} width={40} height={40} source={UnsuccessfulIconSrc} />
  ),
  [CardOrderActivityStatus.Pending]: <CircleActivityIndicator size={40} thickness={3} color={colorsV2.accent} />,
}
