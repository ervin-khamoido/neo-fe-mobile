import React, { memo, useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { colors, PIN_CODE_SIZE, sizes } from '../../../common/constrants'

import { Numpad, NumpadButton } from '../../../component/numpad'
import { titles } from '../../../common/typeface'
import { Button } from '../../../component/button'
import { Spacer } from '../../../component/spacer'
import { BulletsInput } from './components/bullets.input'

import { ChangePINBLoC, ChangePINState } from './change-pin.bloc'

export const ChangePINScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Change Secure PIN',
}

export const ChangePINScreen = memo(props => {
  const bloc = ioc.useBLoC(ChangePINBLoC, props)

  const onDigitInput = useCallback(value => bloc.onDigitInput(value), [bloc])
  const onDigitRemove = useCallback(() => bloc.onDigitRemove(), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <Spacer height={-1} />

          {bloc.state === ChangePINState.Current && (
            <Text style={bloc.error ? titles.pinTitleError : titles.pinTitle}>
              {bloc.error ? bloc.error : 'Enter current PIN'}
            </Text>
          )}
          {bloc.state === ChangePINState.New && <Text style={titles.pinTitle}>Enter New PIN</Text>}
          {bloc.state === ChangePINState.ReEnter && (
            <Text style={bloc.error ? titles.pinTitleError : titles.pinTitle}>
              {bloc.error ? bloc.error : 'Re-enter new PIN'}
            </Text>
          )}
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
          <Spacer height={28} />

          <Button
            title="Submit"
            disabled={bloc.code.length !== PIN_CODE_SIZE || bloc.loading}
            loading={bloc.loading}
            onPress={onSubmit}
          />
          <Spacer height={32} />
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
