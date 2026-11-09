import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { StyleSheet, Text } from 'react-native'
import { Spacer } from '../../../component/spacer'
import { Field } from '../../../component/form/field'
import { Input } from '../../../component/form/input'
import { Button as ButtonV2 } from '../../../component/button-v2'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { colors, sizes } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'
import { BvnBLoC } from './bvn.bloc'

export const BvnScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  animationEnabled: true,
}

export const BvnScreen = observer(props => {
  const bloc = ioc.useBLoC(BvnBLoC, props)

  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(value), [bloc])

  return (
    <KeyboardAwareScrollView style={styles.wrapper} contentContainerStyle={styles.container}>
      <Text style={styles.header}>Provide your BVN</Text>
      <Spacer height={14} />

      <Field error={bloc.error}>
        <Input
          name="bvn"
          autoCapitalize="none"
          autoCorrect={false}
          value={bloc.data?.bvn}
          placeholder="Bank Verification Number"
          onChange={onChange}
          keyboardType={'numeric'}
          maxLength={11}
        />
      </Field>
      <Spacer height={48} />

      <ButtonV2 title="Continue" loading={bloc.loading} disabled={bloc.isContinueBtnDisabled} onPress={onSubmit} />
    </KeyboardAwareScrollView>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
})
