import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Spacer } from '../../../component/spacer'
import { Numpad } from '../../../component/numpad'
import { Button } from '../../../component/button-v2'

import { SendAmountBLoC } from './send-amount.bloc'
import { SimpleModal } from '../../../component/modals/simple-modal'
import { ConfirmModal } from '../../../component/modals/confirm-modal'

export const SendAmountScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: '',
}

export const SendAmountScreen = observer(props => {
  const bloc = ioc.useBLoC(SendAmountBLoC, props)

  const onSubmit = useCallback(() => bloc.onNext(), [bloc])
  const onNumpadInput = useCallback(x => bloc.onNumpadInput(x), [bloc])
  const onNumpadRemove = useCallback(() => bloc.onNumpadRemove(), [bloc])
  const onPinModalConfirm = useCallback(() => bloc.onPinModalConfirm(), [bloc])
  const onPinModalCancel = useCallback(() => bloc.onPinModalCancel(), [bloc])

  const modalBtn = useMemo(() => ({ title: 'Okay', onPress: () => bloc.onModalsClose() }), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.header}>How much would you like to send?</Text>
      <Spacer height={46} />

      <Text style={styles.amountLabel}>USDC</Text>
      <Text style={styles.amount}>{bloc.displayAmount}</Text>
      <Text style={styles.convertedAmount}>{bloc.displayConvertedAmount}</Text>
      <Spacer height={30} />

      <View style={styles.line} />
      <Spacer height={10} />

      <Numpad style={styles.dialPad} onInput={onNumpadInput} onRemove={onNumpadRemove} />

      <Text style={styles.availableLimit}>
        Available {bloc.displayLimitReason}: {bloc.displayLimit}
      </Text>

      <Button title="Next" disabled={bloc.isSendDisabled} onPress={onSubmit} />
      <Spacer height={24} />

      <SimpleModal
        visible={bloc.showExceededLimitModal}
        header={bloc.displayModalHeader}
        body={bloc.displayModalBody}
        button={modalBtn}
      />

      <ConfirmModal
        title={'Set up a pin code?'}
        body={'Before you can send money, you have to set up a pin code.'}
        visible={bloc.showPinModal}
        onConfirm={onPinModalConfirm}
        onCancel={onPinModalCancel}
        confirmButtonText={'Set up'}
      />
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },

  amountLabel: {
    ...fonts.h4Regular,
    color: colors.text,
    textAlign: 'center',
  },
  amount: {
    ...fonts.numbersM,
    color: colors.accent,
    textAlign: 'center',
  },
  convertedAmount: {
    ...fonts.h4Regular,
    color: colors.text,
    textAlign: 'center',
  },
  availableLimit: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  dialPad: {
    marginVertical: sizes.marginV2,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -sizes.marginV2,
  },
})
