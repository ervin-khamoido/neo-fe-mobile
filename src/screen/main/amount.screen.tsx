import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../ioc'
import { CurrencyCode, sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typefaceV2'

import { Button, OutlineButton } from '../../component/button-v2'
import { Spacer, VSpacer } from '../../component/spacer'
import { Numpad } from '../../component/numpad'

import { AmountBLoC } from './amount.bloc'
import { ModalMonitor } from '../../widget/modal-monitor.widget'
import { ScreenMode } from '../../models'
import { BottomModal } from '../../component/modals/bottom-modal'
import { Switch } from './component/switcher'

export const AmountScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const AmountScreen = observer(props => {
  const bloc = ioc.useBLoC(AmountBLoC, props)

  const onModalsClose = useCallback(() => bloc.onModalsClose(), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onCurrencySwitch = useCallback(() => bloc.onSwitch(), [bloc])
  const onNumpadInput = useCallback(x => bloc.onNumpadInput(x), [bloc])
  const onNumpadRemove = useCallback(() => bloc.onNumpadRemove(), [bloc])
  const onLevelUpgrade = useCallback(() => bloc.onLevelUpgrade(), [bloc])
  const onContactSupport = useCallback(() => bloc.onContactSupport(), [bloc])

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.header}>How much would you like to {screenModeTitle[bloc.mode]}?</Text>
      <Spacer height={24} />

      <View style={styles.switchColumn}>
        <Switch
          handleToggle={onCurrencySwitch}
          switched={bloc.currencyToggle}
          leftText={bloc.switcherText.leftText}
          rightText={bloc.switcherText.rightText}
        />
      </View>
      <Spacer height={16} />

      <Text style={styles.amount}>{bloc.formattedAmount}</Text>
      <Text style={styles.convertedAmount}>
        {bloc.destCurrencySymbol}1 = {bloc.exchangeRateWithNairaSymbol}
      </Text>
      <Spacer height={118} />

      <Numpad onInput={onNumpadInput} onRemove={onNumpadRemove} />
      <Spacer height={40} />

      {bloc.displayFundLimit ? (
        <Text style={styles.minMaxLimit}>{bloc.displayFundLimit}</Text>
      ) : (
        <Text style={styles.availableLimit}>
          Available Limit: {bloc.amountCurrencySymbol}
          {bloc.formatCurrency(bloc.maxAmount)}
        </Text>
      )}
      <Spacer height={16} />

      <Button
        textStyle={styles.ctaBtnText}
        title={bloc.submitBtnTitle}
        disabled={bloc.amount === 0 || bloc.loading || bloc.isSubmitBtnDisabled}
        loading={bloc.loading}
        onPress={onSubmit}
      />
      <Spacer height={24} />

      <BottomModal
        visible={bloc.showExceededLimitModal}
        swipeable
        onSwipeDown={onModalsClose}
        onBackdropPress={onModalsClose}
      >
        <Text style={styles.modalHeader}>Sorry</Text>
        <Spacer height={20} />
        <Text style={styles.modalBody}>{bloc.displayModalBody}</Text>
        <Spacer height={40} />

        <View style={styles.modalButtons}>
          <OutlineButton style={styles.modalButton} title="Okay" onPress={onModalsClose} />
          <VSpacer width={17} />
          <Button style={styles.modalButton} title="Contact" onPress={onContactSupport} />
        </View>
      </BottomModal>

      <BottomModal
        visible={bloc.showExceededLimitWithKYCUpgrade}
        swipeable
        onSwipeDown={onModalsClose}
        onBackdropPress={onModalsClose}
      >
        <Text style={styles.modalHeader}>Sorry</Text>
        <Spacer height={20} />
        <Text style={styles.modalBody}>{bloc.displayUpgradeModalBody}</Text>
        <Spacer height={40} />

        <View style={styles.modalButtons}>
          <OutlineButton style={styles.modalButton} title="Okay" onPress={onModalsClose} />
          <VSpacer width={17} />
          <Button style={styles.modalButton} title="Verify" onPress={onLevelUpgrade} />
        </View>
      </BottomModal>

      <ModalMonitor
        isVisible={bloc.showExceededLimitWithKYCUpgrade}
        hostComponentName={`${bloc.mode} Amount Screen`}
        modalName="Amount Exceeds Limit with KYC upgrade"
      />

      <ModalMonitor
        isVisible={bloc.showExceededLimitModal}
        hostComponentName={`${bloc.mode} Amount Screen`}
        modalName="Amount Exceeds Limit"
      />
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const screenModeTitle = {
  [ScreenMode.Buy]: 'deposit',
  [ScreenMode.Sell]: 'withdraw',
}

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
    lineHeight: 16,
    color: colors.text,
    textAlign: 'center',
  },
  amount: {
    ...fonts.numbersM,
    color: colors.accent,
    textAlign: 'center',
  },
  disabledAmount: {
    ...fonts.numbersM,
    color: colors.accentDisabled,
    textAlign: 'center',
  },
  convertedAmount: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
    textAlign: 'center',
  },
  ctaBtnText: {
    ...fonts.h2Regular,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
  },
  switchColumn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    ...fonts.h1SemiBold,
    textAlign: 'center',
    color: colors.text,
  },
  modalBody: {
    ...fonts.h3Regular,
    textAlign: 'center',
    color: colors.text,
    marginHorizontal: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
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
