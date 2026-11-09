import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Progress from 'react-native-progress'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import { AccountLevelBLoC } from './account-level.bloc'
import { fonts } from '../../../common/typefaceV2'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'
import { Spacer } from '../../../component/spacer'
import { Button } from '../../../component/button-v2'
import { LevelDetails } from './component/level-details'

export const AccountLevelScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',

  ...DefaultScreenOptions,
}

export const AccountLevelScreen = observer(props => {
  const bloc = ioc.useBLoC(AccountLevelBLoC, props)

  const formatProgress = useCallback(() => bloc.displayProgress, [bloc])
  const onRequirementPress = useCallback(() => bloc.onRequirement(), [bloc])

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <SafeAreaView style={styles.safeContainer} edges={Edges}>
        <Text style={styles.title}>Account Details</Text>
        <Spacer height={40} />

        {bloc.isFullyVerified ? (
          <View style={styles.fullyVerifiedContainer}>
            <VectorImage width={48} height={48} source={ShieldIconSrc} />
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <Progress.Circle
              indeterminate={false}
              color={colors.accent}
              size={120}
              progress={bloc.progress}
              borderWidth={0}
              thickness={12}
              unfilledColor={colors.border}
              showsText
              formatText={formatProgress}
              textStyle={styles.progressText}
            />
          </View>
        )}

        <Spacer height={24} />

        {bloc.isFullyVerified ? (
          <Text style={styles.fullyVerifiedLabel}>Your Account is Fully Verified</Text>
        ) : (
          !!bloc.displayNextRequirement && (
            <Button
              title={bloc.displayNextRequirement}
              loading={bloc.loading}
              disabled={bloc.loading || bloc.isNextRequirementInactive}
              onPress={onRequirementPress}
            />
          )
        )}
        <Spacer height={40} />

        {bloc.currentBenefits.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Limits and Features</Text>
              <View style={styles.sectionLine} />
              <Spacer height={10} />

              {bloc.currentBenefits.map(x => (
                <View key={x.label + x.formattedValue} style={styles.benefit}>
                  <Text style={styles.benefitLabel}>{x.label}</Text>
                  <Text style={styles.benefitValue}>{x.formattedValue}</Text>
                </View>
              ))}
            </View>
            <Spacer height={20} />
          </>
        )}

        {!bloc.isFullyVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Levels</Text>
            <View style={styles.sectionLine} />
            <Spacer height={20} />

            {bloc.levelDetails.map((x, i, items) => (
              <LevelDetails
                key={x.code}
                name={x.name}
                status={x.status}
                benefitsSummary={x.benefitsSummary}
                requirements={x.requirements}
                remainingRequirements={x.remainingRequirements}
                isLastItem={i === items.length - 1}
              />
            ))}
          </View>
        )}
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges = ['bottom'] as any

const ShieldIconSrc = require('../../../../assets/images/shield.icon.svg')

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  safeContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.marginV2,
  },

  title: {
    ...fonts.h1Regular,
    color: colors.text,
  },

  fullyVerifiedContainer: {
    flex: 0,
    alignSelf: 'center',
    backgroundColor: colors.accent,
    borderRadius: 100,
    padding: 36,
  },

  progressContainer: {
    flex: 0,
    alignSelf: 'center',
  },
  progressText: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },

  fullyVerifiedLabel: {
    ...fonts.h3SemiBold,
    color: colors.text,
    textAlign: 'center',
  },

  section: {},
  sectionTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  sectionLine: {
    marginTop: 8,
    backgroundColor: colors.border2,
    height: 1,
  },

  benefit: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  benefitLabel: {
    flex: 1,
    ...fonts.h4Regular,
    color: colors.text,
  },
  benefitValue: {
    flex: 0,
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
})
