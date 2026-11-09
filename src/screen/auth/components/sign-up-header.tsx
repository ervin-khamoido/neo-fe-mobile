import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'

import { Progress } from '../../../component/progress'
import { Spacer } from '../../../component/spacer'
import { colors } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'

type SignUpHeaderProps = {
  step: number
  steps: number
  title: string
}
export const SignUpHeader = memo<SignUpHeaderProps>(({ step, steps, title }) => (
  <>
    <Progress progress={step / steps} />
    <Spacer height={14} />
    <Text style={styles.step}>{/*STEP {step}/{steps}*/}</Text>
    <Text style={styles.title}>{title}</Text>
  </>
))

const styles = StyleSheet.create({
  step: {
    ...fonts.h5SemiBold,
    letterSpacing: 2.5,
    lineHeight: 28,
    color: colors.text,
  },
  title: {
    ...fonts.h4SemiBold,
    color: colors.primary,
  },
})
