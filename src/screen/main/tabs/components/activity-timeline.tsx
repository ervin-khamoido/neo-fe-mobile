import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import VectorImage from 'react-native-vector-image'

import { colors } from '../../../../common/constrants'
import { colors as colorsV2 } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typeface'
import { VSpacer } from '../../../../component/spacer'

export interface IActivityTimelineStatus {
  name: string
  completed: boolean
}

type ActivityStatusTimelineProps = {
  statuses: IActivityTimelineStatus[]
}
export const ActivityStatusTimeline = memo<ActivityStatusTimelineProps>(props => {
  const { statuses } = props

  return (
    <>
      {statuses.map((status, index) => (
        <View style={styles.container} key={status.name}>
          <View style={styles.lineContainer}>{index === 0 ? null : <View style={styles.grayLine} />}</View>

          <View style={styles.pointContainer}>
            <View style={styles.leftAlignContent}>
              {status.completed ? (
                <View style={styles.greenCircle}>
                  <VectorImage style={styles.greenCheckmarkIcon} width={24} height={24} source={CheckmarkIconSrc} />
                </View>
              ) : (
                <View style={styles.greyCircle}>
                  <VectorImage style={styles.grayCheckmarkIcon} width={24} height={24} source={CheckmarkIconSrc} />
                </View>
              )}
            </View>
            <VSpacer width={12} />

            <Text style={styles.statusText}>{status.name}</Text>
          </View>
        </View>
      ))}
    </>
  )
})

const CheckmarkIconSrc = require('../../../../../assets/images/checkmark-v2.icon.svg')

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  pointContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAlignContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  lineContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenLine: {
    height: 24,
    width: 2,
    backgroundColor: colorsV2.accent,
  },
  grayLine: {
    height: 24,
    width: 2,
    backgroundColor: colorsV2.disabledBackground4,
  },
  greyCircle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorsV2.background,
    borderWidth: 2,
    borderColor: colorsV2.disabledBackground4,
    borderRadius: 20,
  },
  greenCircle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colorsV2.accent,
    borderRadius: 20,
  },
  grayCheckmarkIcon: {
    tintColor: colorsV2.disabledBackground4,
    width: 24,
    height: 24,
  },
  greenCheckmarkIcon: {
    tintColor: colorsV2.background,
  },
  statusText: {
    ...fonts.h4Regular,
    color: colors.text,
  },
})
