import React, { useCallback } from 'react'
import { StackNavigationOptions } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, Text, View } from 'react-native'

import ioc from '../../../ioc'
import { SasDetailsBloc } from './sas-details.bloc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'
import { Spacer } from '../../../component/spacer'
import VectorImage from 'react-native-vector-image'
import { Button } from '../../../component/button-v2'
import { JackpotBanner } from './components/jackpot-banner'

export const SasDetailsOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const SasDetailsScreen = observer(props => {
  const bloc = ioc.useBLoC(SasDetailsBloc, props)

  const onParticipate = useCallback(() => bloc.onParticipate(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.title}>Dream Lock</Text>
      <Spacer height={24} />

      {bloc.lottery?.nextDraw && (
        <View style={styles.rowCenter}>
          <JackpotBanner lottery={bloc.lottery} />
        </View>
      )}

      <Spacer height={40} />

      <View style={styles.row}>
        <VectorImage source={ClockIconSrc} width={24} height={24} style={styles.accentIcon} />
        <Text style={styles.regularTxt}>The longer you save, the more chances you have to win</Text>
      </View>
      <Spacer height={20} />

      <View style={styles.row}>
        <VectorImage source={LockIconSrc} width={24} height={24} style={styles.accentIcon} />
        <Text style={styles.regularTxt}>You are required to save money for a minimum of 7 days to qualify</Text>
      </View>
      <Spacer height={20} />

      <View style={styles.row}>
        <VectorImage source={DollarAccentIconSrc} width={24} height={24} style={styles.accentIcon} />
        <Text style={styles.regularTxt}>You will lose your dream points if you withdraw from your Dream Lock</Text>
      </View>
      <Spacer height={20} />

      <View style={styles.row}>
        <VectorImage style={styles.calendarIcon} source={CalendarV2IconSrc} width={24} height={24} />
        <Text style={styles.regularTxt}>Giveaways are on Saturdays</Text>
      </View>
      <Spacer height={24} />
      <Spacer height={-1} />

      <Button title="Participate" onPress={onParticipate} />
      <Spacer height={24} />
    </SafeAreaView>
  )
})

const ClockIconSrc = require('../../../../assets/images/clock.icon.svg')
const LockIconSrc = require('../../../../assets/images/lock-v2.icon.svg')
const DollarAccentIconSrc = require('../../../../assets/images/dollar-sign-accent.icon.svg')
const CalendarV2IconSrc = require('../../../../assets/images/calendar-v2.icon.svg')

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.gray3,
  },
  regularTxt: {
    paddingHorizontal: 8,
    ...fonts.h5Regular,
    lineHeight: 20,
    color: colors.textLabel,
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  accentIcon: {
    tintColor: colors.accent,
    width: 24,
    height: 24,
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
})
