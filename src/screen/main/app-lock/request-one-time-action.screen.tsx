import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'
import { fonts, titles } from '../../../common/typeface'

import { Numpad, NumpadButton } from '../../../component/numpad'
import { Spacer } from '../../../component/spacer'

import { RequestOneTimeActionBLoC } from './request-one-time-action.bloc'
import { BulletsInput } from './components/bullets.input'

export const RequestOneTimeActionScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Confirm Action',
}

export const RequestOneTimeActionScreen = memo(props => {
  const bloc = ioc.useBLoC(RequestOneTimeActionBLoC, props)

  const onDigitInput = useCallback(value => bloc.onDigitInput(value), [bloc])
  const onDigitRemove = useCallback(() => bloc.onDigitRemove(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <Spacer height={-1} />
          <Text style={bloc.error ? titles.pinTitleError : titles.pinTitle}>
            {bloc.error ? bloc.error : 'Enter PIN'}
          </Text>
          <Spacer height={9} />

          <BulletsInput length={bloc.code.length} error={bloc.error} />
          <Spacer height={-1} />

          <Numpad
            style={styles.numpad}
            disabled={bloc.loading}
            leftBottomBtn={leftBottomBtn}
            onInput={onDigitInput}
            onRemove={onDigitRemove}
          />
          <Spacer height={72} />
        </SafeAreaView>
      )}
    </Observer>
  )
})

const Edges: Edge[] = ['bottom']
const leftBottomBtn: NumpadButton = { label: '', value: '', key: 'noop', action: 'input', disabled: true }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.margin,
    backgroundColor: colors.background,
  },
  numpad: {
    flex: 1,
    minHeight: 200,
  },
})
