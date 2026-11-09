import React, { memo, useCallback, useMemo } from 'react'
import Modal from 'react-native-modal'
import { StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { colors } from '../../../common/constrants'
import { fonts, titles } from '../../../common/typeface'

import { BulletsInput } from '../app-lock/components/bullets.input'
import { Spacer } from '../../../component/spacer'
import { Numpad, NumpadButton } from '../../../component/numpad'
import { LinkButton } from '../../../component/button'
import { ResetPINModal } from '../component/reset-pin.modal'

import { PinBLoC } from './pin.bloc'
import { ResetPINSentModal } from '../component/reset-pin-sent.modal'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'
import { BasicModal } from '../../../component/modals/basic-modal'

const FingerPrintIcon = require('../../../../assets/images/fingerprint.icon.svg')

export const PinWidget = memo(props => {
  const bloc = ioc.useBLoC(PinBLoC, props)

  const onDigitInput = useCallback(x => bloc.onDigitInput(x), [bloc])
  const onDigitRemove = useCallback(() => bloc.onDigitRemove(), [bloc])

  const onForgotPIN = useCallback(() => bloc.onForgotPIN(), [bloc])
  const onResetCancel = useCallback(() => bloc.onResetCancel(), [bloc])
  const onResetConfirm = useCallback(() => bloc.onResetConfirm(), [bloc])
  const onResetSuccessClose = useCallback(() => bloc.onResetSuccessClose(), [bloc])

  const biometricBtn: NumpadButton = useMemo(
    () => ({
      label: <VectorImage style={styles.biometric} width={42} height={42} source={FingerPrintIcon} />,
      value: 'biometric',
      key: 'biometric',
      action: 'input',
    }),
    [],
  )

  return (
    <Observer>
      {() => (
        <>
          <BasicModal
            style={styles.modal}
            isVisible={bloc.requestPIN}
            animationOut="slideOutDown"
            animationInTiming={1}
            useNativeDriver
            hideModalContentWhileAnimating
            hardwareAccelerated
          >
            <View style={styles.container}>
              <Spacer height={-1} />
              {bloc.enableOnlyReset ? (
                <Text style={titles.pinTitle}>Max Attempts Exceeded</Text>
              ) : (
                <Text style={bloc.error ? titles.pinTitleError : titles.pinTitle}>
                  {bloc.error ? bloc.error : 'Enter PIN'}
                </Text>
              )}
              <Spacer height={9} />

              {bloc.enableOnlyReset ? null : <BulletsInput length={bloc.code.length} error={bloc.error} />}
              <Spacer height={37} />

              {bloc.enableOnlyReset ? (
                <LinkButton textStyle={titles.pinTitleReset} type="primary" title="Reset PIN" onPress={onForgotPIN} />
              ) : (
                <LinkButton type="primary" title="Forgot PIN?" onPress={onForgotPIN} />
              )}

              <Spacer height={-1} />

              <Numpad
                style={styles.numpad}
                disabled={bloc.loading || bloc.enableOnlyReset}
                leftBottomBtn={bloc.biometricEnabled ? biometricBtn : NoopBiometric}
                onInput={onDigitInput}
                onRemove={onDigitRemove}
              />
              <Spacer height={72} />
            </View>

            <ResetPINModal
              visible={bloc.showResetPin}
              email={bloc.userEmail}
              loading={bloc.resetPinLoading}
              onReset={onResetConfirm}
              onCancel={onResetCancel}
            />
            <ModalMonitor isVisible={bloc.showResetPin} hostComponentName="Pin Modal" modalName="Reset PIN" />

            <ResetPINSentModal visible={bloc.showResetPinSent} email={bloc.userEmail} onClose={onResetSuccessClose} />
            <ModalMonitor isVisible={bloc.showResetPinSent} hostComponentName="Pin Modal" modalName="Reset PIN Sent" />
          </BasicModal>
          <ModalMonitor isVisible={bloc.requestPIN} hostComponentName="Main Stack" modalName="PIN" />
        </>
      )}
    </Observer>
  )
})

const NoopBiometric: NumpadButton = { label: '', value: '', key: 'noop', action: 'input', disabled: true }

const styles = StyleSheet.create({
  modal: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  numpad: {
    flex: 1,
    minHeight: 200,
  },
  resetPINTxt: {
    ...fonts.h1SemiBold,
  },
  biometric: {
    tintColor: colors.primary,
    width: 42,
    height: 42,
  },
})
