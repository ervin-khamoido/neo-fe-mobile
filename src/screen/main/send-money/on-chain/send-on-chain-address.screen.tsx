import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../../ioc'

import { sizes } from '../../../../common/constrants'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../../component/spacer'
import { Button } from '../../../../component/button-v2'

import { SendOnChainAddressBLoC, TabValues } from './send-on-chain-address.bloc'
import { RadioButtonsInput } from '../../tabs/components/radio-buttons-input'
import { Input } from '../../../../component/form/input-v2'
import { Field } from '../../../../component/form/field'
import { SimpleSelectInput } from '../../tabs/components/simple-select-input'
import { ConfirmModal } from '../../../../component/modals/confirm-modal'

export const SendOnChainAddressScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: '',
}

export const SendOnChainAddressScreen = observer(props => {
  const bloc = ioc.useBLoC(SendOnChainAddressBLoC, props)

  const onSubmit = useCallback(() => bloc.onNext(), [bloc])
  const onEdit = useCallback(() => bloc.onEdit(), [bloc])
  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onPinModalCancel = useCallback(() => bloc.onPinModalCancel(), [bloc])
  const onPinModalConfirm = useCallback(() => bloc.onPinModalConfirm(), [bloc])

  const renderWalletAddressContent = () => (
    <>
      <View style={styles.optionRow}>
        <Text style={styles.optionRowText}>Token</Text>

        <SimpleSelectInput
          title="What Token?"
          name="token"
          value={bloc.tokenSelectedValue}
          onChange={onChange}
          options={bloc.tokenOptions}
        />
      </View>
      <Spacer height={20} />

      <View style={styles.optionRow}>
        <Text style={styles.optionRowText}>Network</Text>

        <SimpleSelectInput
          title="What Network?"
          name="network"
          value={bloc.networkSelectedValue}
          onChange={onChange}
          options={bloc.networkOptions}
        />
      </View>
      <Spacer height={36} />

      <Field error={bloc.error}>
        <Input
          style={styles.walletAddressInput}
          name="address"
          autoCapitalize="none"
          autoCorrect={false}
          value={bloc.walletAddressValue}
          placeholder="Wallet Address"
          onChange={onChange}
        />
      </Field>
    </>
  )

  /* TODO: */
  const renderQRCodeContent = () => <Text>QR-Code</Text>

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <KeyboardAwareScrollView style={styles.wrapper} contentContainerStyle={styles.container2}>
        <Text style={styles.header}>How much would you like to send?</Text>
        <Spacer height={46} />

        <View style={styles.amountWrapper}>
          <VSpacer width={32} />

          <View style={styles.amountColumn}>
            <Text style={styles.amountLabel}>USDC</Text>
            <Text style={styles.amount}>{bloc.displayAmount}</Text>
            <Text style={styles.convertedAmount}>{bloc.displayConvertedAmount}</Text>
          </View>

          <VSpacer width={8} />
          <View style={styles.editBtnContainer}>
            <TouchableOpacity onPress={onEdit}>
              <VectorImage style={styles.editIcon} width={24} height={24} source={EditIconSrc} />
            </TouchableOpacity>
          </View>
        </View>
        <Spacer height={32} />

        <RadioButtonsInput
          name="selectedTab"
          options={bloc.tabOptions}
          value={bloc.data.selectedTab}
          onChange={onChange}
        />
        <Spacer height={44} />

        {bloc.data.selectedTab === TabValues.WalletAddress && renderWalletAddressContent()}
        {bloc.data.selectedTab === TabValues.QRCode && renderQRCodeContent()}
        <Spacer height={24} />
        <Spacer height={-1} />

        <Button title="Next" disabled={bloc.isSendDisabled} loading={bloc.loading} onPress={onSubmit} />
        <Spacer height={24} />
      </KeyboardAwareScrollView>

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

const EditIconSrc = require('../../../../../assets/images/edit-v2.icon.svg')

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container2: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },

  amountWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  amountColumn: {
    justifyContent: 'center',
    alignItems: 'center',
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
  editBtnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },

  walletAddressInput: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray9,
    paddingBottom: 12,
  },
  editIcon: {
    width: 24,
    height: 24,
  },
})
