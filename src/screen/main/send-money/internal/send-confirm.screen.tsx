import React, { memo, useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../../ioc'

import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer } from '../../../../component/spacer'
import { Button } from '../../../../component/button-v2'

import { SendConfirmBLoC } from './send-confirm.bloc'

export const SendConfirmScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: 'Send Confirm',
}

export const SendConfirmScreen = memo(props => {
  const bloc = ioc.useBLoC(SendConfirmBLoC, props)

  const onSend = useCallback(() => bloc.onSend(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <Text style={styles.title}>
            You're about to send <Text style={styles.emphasize}>{bloc.displayAmountUsdc}</Text> to{' '}
            <Text style={styles.emphasize}>{bloc.displayName}</Text>
          </Text>
          <Spacer height={8} />
          <Text style={styles.label}>Once the funds are sent, NeobankApp won’t be able to undo the transfer.</Text>

          <Spacer height={-1} />

          <Button title="Send" onPress={onSend} />
          <Spacer height={24} />
        </SafeAreaView>
      )}
    </Observer>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  title: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  label: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  emphasize: {
    color: colors.accent,
  },
})
