import React, { Fragment, memo, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Spacer, VSpacer } from '../../../../component/spacer'
import { LevelStatus, LevelStatusName } from '../../../../models/level/definitions'
import VectorImage from 'react-native-vector-image'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { LevelRequirementInfo } from '../../../../models/level/user-level-details'

type LevelDetailsProps = {
  name: string
  status: LevelStatus
  benefitsSummary: string
  requirements: LevelRequirementInfo[]
  remainingRequirements: LevelRequirementInfo[]

  isLastItem?: boolean
}
export const LevelDetails = memo<LevelDetailsProps>(props => {
  const { name, status, benefitsSummary, requirements, remainingRequirements, isLastItem } = props

  const completedRequirementsMap = useMemo(
    () => requirements.map(x => !remainingRequirements.find(y => x.code === y.code)),
    [requirements, remainingRequirements],
  )
  const isApproved = status === LevelStatus.Approved

  return (
    <View style={styles.container}>
      <View style={styles.side}>
        <View style={isApproved ? stylesExt.lockCircleSuccess : styles.lockCircle}>
          {isApproved ? (
            <VectorImage style={styles.checkmarkWhite} width={24} height={24} source={CheckmarkIconSrc} />
          ) : (
            <VectorImage width={20} height={20} source={LockIconSrc} />
          )}
        </View>
        {!isLastItem && <View style={isApproved ? stylesExt.verticalLineSuccess : styles.verticalLine} />}
      </View>
      <VSpacer width={12} />

      <View style={styles.main}>
        <Spacer height={4} />

        <View style={styles.mainHeader}>
          <Text style={styles.levelName}>{name}</Text>
          <Text style={styles.levelStatus}>{LevelStatusName[status]}</Text>
        </View>

        <Text style={styles.benefitsSummary}>{benefitsSummary}</Text>
        <Spacer height={20} />

        {requirements.map((x, i) => (
          <Fragment key={x.code}>
            <View style={styles.requirement}>
              <VectorImage
                style={completedRequirementsMap[i] ? styles.checkmarkGreen : styles.checkmarkGray}
                width={16}
                height={16}
                source={CheckmarkIconSrc}
              />
              <VSpacer width={8} />
              <Text style={styles.requirementDescription}>{x.description}</Text>
            </View>
            <Spacer height={8} />
          </Fragment>
        ))}
        <Spacer height={20} />
      </View>
    </View>
  )
})

const CheckmarkIconSrc = require('../../../../../assets/images/check.icon.svg')
const LockIconSrc = require('../../../../../assets/images/lock-v2.icon.svg')

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'row',
  },
  side: {
    flexGrow: 0,
  },

  lockCircle: {
    flexGrow: 0,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 50,
  },
  checkmarkWhite: {
    tintColor: colors.textLight,
  },
  verticalLine: {
    flexGrow: 1,
    alignSelf: 'center',
    width: 2,
    backgroundColor: colors.border,
  },

  main: {
    flex: 1,
    flexGrow: 1,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  levelName: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
  levelStatus: {
    ...fonts.h6Regular,
    color: colors.textSecondary,
  },

  benefitsSummary: {
    flex: 0,
    ...fonts.h4Regular,
    color: colors.text,
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkmarkGreen: {
    flexGrow: 0,
    tintColor: colors.accent,
  },
  checkmarkGray: {
    flexGrow: 0,
    tintColor: colors.textDisabled,
  },
  requirementDescription: {
    flex: 1,
    flexGrow: 1,
    ...fonts.h4PreSemiBold,
    color: colors.text,
  },
})

const stylesExt = StyleSheet.create({
  lockCircleSuccess: {
    ...styles.lockCircle,
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  verticalLineSuccess: {
    ...styles.verticalLine,
    backgroundColor: colors.accent,
  },
})
