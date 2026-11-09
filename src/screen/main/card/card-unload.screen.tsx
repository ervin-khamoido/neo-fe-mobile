import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Spacer } from '../../../component/spacer'
import { Numpad } from '../../../component/numpad'
import { Button } from '../../../component/button-v2'

import { CardUnloadBLoC } from './card-unload.bloc'

export const CardUnloadScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: '',
}

export const CardUnloadScreen = observer(props => {
  const bloc = ioc.useBLoC(CardUnloadBLoC, props)

  const onSubmit = useCallback(() => bloc.onWithdraw(), [bloc])
  const onNumpadInput = useCallback(x => bloc.onNumpadInput(x), [bloc])
  const onNumpadRemove = useCallback(() => bloc.onNumpadRemove(), [bloc])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>How much would you like to withdraw from your card?</Text>
      <Spacer height={40} />

      <View style={styles.row}>
        <Text style={styles.usdBalance}>USD</Text>
      </View>
      <Spacer height={16} />

      <Text style={styles.amount}>{bloc.displayAmount}</Text>
      <Spacer height={56} />

      <Numpad style={styles.dialPad} onInput={onNumpadInput} onRemove={onNumpadRemove} />
      <Spacer height={40} />

      {bloc.displayFundLimit ? (
        <Text style={styles.minMaxLimit}>{bloc.displayFundLimit}</Text>
      ) : (
        <Text style={styles.availableLimit}>Available Balance: {bloc.displayBalance}</Text>
      )}
      <Spacer height={16} />

      <Button
        style={styles.ctaBtn}
        title="Withdraw"
        disabled={bloc.isWithdrawCashDisabled}
        onPress={onSubmit}
        loading={bloc.unloadLoading}
      />
      <Spacer height={24} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  amount: {
    ...fonts.numbersM,
    color: colors.accent,
    textAlign: 'center',
  },
  ctaBtn: {
    marginBottom: 20,
  },
  dialPad: {
    minHeight: 200,
    marginHorizontal: -sizes.marginV2,
  },
  usdBalance: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  availableLimit: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  minMaxLimit: {
    ...fonts.h5Regular,
    color: colors.danger2,
    textAlign: 'center',
  },
})
