import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../../ioc'

import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { CircleActivityIndicator } from '../../../../component/circle-activity-indicator'
import { Spacer } from '../../../../component/spacer'

import { OperationStatus, SendResultBLoC } from './send-result.bloc'
import { Button } from '../../../../component/button-v2'

export const SendResultScreenOptions: StackNavigationOptions = {
  headerShown: false,
  headerTitle: '',
}

export const SendResultScreen = observer(props => {
  const bloc = ioc.useBLoC(SendResultBLoC, props)

  const onClose = useCallback(() => bloc.onClose(), [bloc])

  const renderPending = () => (
    <View style={styles.box}>
      <CircleActivityIndicator size={120} color={colors.accent} />
      <Spacer height={34} />
      <Text style={styles.label}>Sending...</Text>
    </View>
  )

  const renderSuccess = () => (
    <>
      <View style={styles.box}>
        <VectorImage style={styles.successIcon} source={CheckCircleIconSrc} width={120} height={120} />
        <Spacer height={34} />
        <Text style={styles.label}>
          You've successfully sent <Text style={styles.emphasize}>{bloc.displayAmountUsdc}</Text> to{' '}
          <Text style={styles.emphasize}>{bloc.displayUsername}</Text>
        </Text>
      </View>
      <Button title="Close" onPress={onClose} />
      <Spacer height={24} />
    </>
  )

  const renderFailure = () => (
    <>
      <View style={styles.box}>
        <VectorImage style={styles.failureIcon} source={AlertTriangleIconSrc} width={120} height={120} />
        <Spacer height={34} />
        <Text style={styles.label}>{bloc.displayFailureMsg}</Text>
      </View>
      <Button title="Close" onPress={onClose} />
      <Spacer height={24} />
    </>
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      {bloc.operationStatus === OperationStatus.Pending && renderPending()}
      {bloc.operationStatus === OperationStatus.Success && renderSuccess()}
      {bloc.operationStatus === OperationStatus.Failure && renderFailure()}
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const CheckCircleIconSrc = require('../../../../../assets/images/check-circle.icon.svg')
const AlertTriangleIconSrc = require('../../../../../assets/images/alert-triangle.icon.svg')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },

  box: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    tintColor: colors.accent,
  },
  failureIcon: {
    tintColor: colors.danger,
  },
  label: {
    ...fonts.h1SemiBold,
    color: colors.text,
    textAlign: 'center',
    width: '80%',
  },
  emphasize: {
    color: colors.accent,
  },
})
