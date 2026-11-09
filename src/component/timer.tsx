import React, { useLayoutEffect, useMemo, useState } from 'react'
import { Text, View, StyleSheet, ViewProps } from 'react-native'
import VectorImage from 'react-native-vector-image'
import { differenceInSeconds, isAfter } from 'date-fns'

import { colors } from '../common/constrants'
import { fonts } from '../common/typeface'
import { VSpacer } from './spacer'
import { observer } from 'mobx-react-lite'

const ClockIconSrc = require('../../assets/images/clock.icon.svg')

/**
 * TODO: refactor to widget! Do not use useState/useLayoutEffect
 */

type TimerProps = {
  endTS: Date

  textStyle?: ViewProps['style']
  style?: ViewProps['style']

  hideIcon?: true
  prefix?: string

  onTimeOut?: () => void
}
export const Timer = observer((props: TimerProps) => {
  const { endTS, style, textStyle, prefix, hideIcon, onTimeOut } = props
  const containerStyle = useMemo(() => [styles.container, style ?? {}], [style])
  const timeStyle = useMemo(() => [styles.time, textStyle ?? {}], [textStyle])

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
  const min = `${Math.floor(seconds / 60)}`.padStart(2, '0')
  const sec = `${Math.floor(seconds % 60)}`.padStart(2, '0')

  return (
    <View style={containerStyle}>
      {!hideIcon && <VectorImage style={styles.clockIcon} width={24} height={24} source={ClockIconSrc} />}
      <VSpacer width={4} />

      <Text style={timeStyle}>
        {prefix ?? ''}
        {min}:{sec}
      </Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  clockIcon: {
    width: 24,
    height: 24,
  },
})
