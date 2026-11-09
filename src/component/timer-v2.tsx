import React, { useLayoutEffect, useMemo, useState } from 'react'
import { Text, View, StyleSheet, ViewProps } from 'react-native'
import { differenceInSeconds, isAfter } from 'date-fns'

import { colors } from '../common/colorV2'
import { fonts } from '../common/typefaceV2'
import { observer } from 'mobx-react-lite'

type TimerProps = {
  endTS: Date

  textStyle?: ViewProps['style']
  style?: ViewProps['style']

  prefix?: string

  onTimeOut?: () => void
}
export const TimerV2 = observer<TimerProps>(({ endTS, style, textStyle, onTimeOut, prefix = 'Time remaining:' }) => {
  const containerStyle = useMemo(() => [styles.container, style ?? {}], [style])
  const timeStyle = useMemo(() => [styles.dateRegular, textStyle ?? {}], [textStyle])

  const [currentTS, setCurrentTS] = useState(new Date())

  useLayoutEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTS(now)
      if (isAfter(now, endTS)) {
        onTimeOut?.()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimeOut, endTS, setCurrentTS])

  const seconds = currentTS < endTS ? differenceInSeconds(endTS, currentTS) : 0
  const days = `${Math.floor(seconds / (60 * 60 * 24))}`
  const hours = `${Math.floor((seconds / (60 * 60)) % 24)}`.padStart(2, '0')
  const min = `${Math.floor((seconds / 60) % 60)}`.padStart(2, '0')

  return (
    <View style={containerStyle}>
      <View style={styles.row}>
        <Text style={timeStyle}>{prefix} </Text>

        <View style={styles.dateRow}>
          <Text style={styles.number}>{days}</Text>
          <Text style={timeStyle}> days </Text>
          <Text style={styles.number}> {hours}</Text>
          <Text style={timeStyle}> hours </Text>
          <Text style={styles.number}> {min}</Text>
          <Text style={timeStyle}> min </Text>
        </View>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  number: {
    ...fonts.h4SemiBold,
    lineHeight: 16,
    color: colors.text,
  },
  dateRegular: {
    ...fonts.h6Regular,
    lineHeight: 12,
    color: colors.textLabel,
  },
})
