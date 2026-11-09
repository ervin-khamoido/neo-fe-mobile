import React, { useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { PIN_CODE_SIZE, sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { EnableLockBLoC, EnableLockState } from './enable-lock.bloc'
import { Numpad, NumpadButton } from '../../../component/numpad'
import { titles } from '../../../common/typeface'
import { Button } from '../../../component/button'
import { Spacer } from '../../../component/spacer'
import { BulletsInput } from './components/bullets.input'

export const EnableLockScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Set Secure PIN',
}

export const EnableLockScreen = observer(props => {
  const bloc = ioc.useBLoC(EnableLockBLoC, props)

  const onDigitInput = useCallback(value => bloc.onDigitInput(value), [bloc])
  const onDigitRemove = useCallback(() => bloc.onDigitRemove(), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Spacer height={-1} />
      {bloc.state === EnableLockState.Create && (
        <Text style={bloc.error ? titles.pinTitleError : titles.pinTitle}>
          {bloc.error ? bloc.error : 'Create PIN'}
        </Text>
      )}
      {bloc.state === EnableLockState.ReEnter && <Text style={titles.pinTitle}>Re-enter PIN</Text>}
      <Spacer height={9} />

      <BulletsInput length={bloc.code.length} error={bloc.error} />
      <Spacer height={24} />

      <Text style={styles.description}>Please create a 4-digit pin to secure your account and transactions</Text>
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
  description: {
    paddingHorizontal: sizes.marginV2,
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
})
