import React, { memo } from 'react'
import { Observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { TransactionsActivityTitle } from './common'
import { colors, sizes } from '../../../common/constrants'
import { MiscStyles } from '../../../component/common'
import { fonts } from '../../../common/typeface'

import { CopiableTextWidget } from '../tabs/widget/copiable-text.widget'

import { DummyActivityDetailsBLoC } from './dummy-activity-detail.bloc'
import { Spacer } from '../../../component/spacer'

export const DummyActivityDetailsScreenOptions = ({ route }) => {
  const { headerShown = true } = route.params ?? {}

  return {
    headerShown: headerShown,
    title: TransactionsActivityTitle,
  } as StackNavigationOptions
}

export const DummyActivityDetailsScreen = memo(props => {
  const bloc = ioc.useBLoC(DummyActivityDetailsBLoC, props)

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.list} edges={Edges}>
          <Spacer height={30} />

          <VectorImage style={styles.infoIcon} width={64} height={64} source={InfoIconSrc} />
          <Text style={styles.addedText}>{bloc.statusName}</Text>
          <Text style={styles.text}>{bloc.statusAt}</Text>

          <Text style={styles.purchaseAmountUSD}>{bloc.displayAmountUsdc}</Text>
          <Spacer height={40} />

          <View style={styles.dottedLine} />
          <Spacer height={40} />

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLeftText}>Transaction Type</Text>
              <View style={styles.transactionTypeTextWrapper}>
                <Text style={styles.transactionTypeText}>{bloc.activity?.type.toLowerCase()}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLeftText}>Order Number</Text>
              <CopiableTextWidget style={styles.text} copyText={bloc.activity?.orderReferenceNumber} showCopyIcon>
                {bloc.activity?.orderReferenceNumber}
              </CopiableTextWidget>
            </View>
          </View>

          <View style={styles.solidLine} />
        </SafeAreaView>
      )}
    </Observer>
  )
})

const InfoIconSrc = require('../../../../assets/images/info2.icon.svg')

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
    alignItems: 'center',
  },
  container: {
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    height: '100%',
  },
  infoContainer: {
    alignSelf: 'stretch',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 9,
  },
  text: {
    ...fonts.h5Regular,
    color: colors.text,
  },
  addedText: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  purchaseAmountUSD: {
    ...fonts.numbersS,
    color: colors.text,
  },
  exchangeAmountNaira: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  dottedLine: {
    ...MiscStyles.dottedLine,
  },
  solidLine: {
    ...MiscStyles.solidLine,
  },
  transactionTypeTextWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderRadius: 16,
    backgroundColor: colors.gray3,
  },
  transactionTypeText: {
    ...fonts.h5Bold,

    color: colors.input,
  },
  infoLeftText: {
    ...fonts.h4Regular,
    color: colors.textSecondaryDark,
  },
  infoIcon: {
    width: 64,
    height: 64,
  },
})
