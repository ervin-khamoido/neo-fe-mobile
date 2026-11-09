import React, { useCallback } from 'react'
import { StyleSheet, Text, Platform, View, KeyboardAvoidingView } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { LinkButton } from '../../../component/button'
import { CodeInput } from '../../../component/form/input'

import { SignInEmailCodeBLoC } from './sign-in-email-code.bloc'
import { Spacer, VSpacer } from '../../../component/spacer'
import { Timer } from '../../../component/timer'
import { Button } from '../../../component/button-v2'

export const SignInEmailCodeScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
}

const inputAccessoryViewID = 'signInEmailScreenAccessoryView'

export const SignInEmailCodeScreen = observer(props => {
  const bloc = ioc.useBLoC(SignInEmailCodeBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onEdit = useCallback(() => bloc.onEdit(), [bloc])
  const onResend = useCallback(() => bloc.onResend(), [bloc])
  const onVerify = useCallback(() => bloc.onVerify(), [bloc])
  const onTimeOut = useCallback(() => bloc.onTimeOut(), [bloc])

  const isVerifyBtnDisabled = bloc.loading || bloc.data.code.length < bloc.codeLength

  return (
    <SafeAreaView style={styles.wrapper} edges={Edges}>
      <KeyboardAvoidingView
        style={styles.avoidContainer}
        enabled={Platform.OS === 'ios'}
        behavior={'padding'}
        keyboardVerticalOffset={sizes.headerHeightV2 + initialWindowMetrics.insets.top}
      >
        <Spacer height={44} />
        <Text style={styles.title}>
          Enter the code sent to <Text style={styles.titleEmail}>{bloc.email}</Text>
        </Text>
        <View style={styles.editBtnRow}>
          <LinkButton
            title="Edit"
            type="primary"
            textStyle={styles.editBtnText}
            onPress={onEdit}
            tapTargets={tapTargets}
          />
        </View>
        <Spacer height={40} />

        <View style={styles.codeInputWrapper}>
          <CodeInput
            inputAccessoryViewID={inputAccessoryViewID}
            name="code"
            value={bloc.data.code}
            onChange={onChange}
            autoFocus
            cells={bloc.codeLength}
            onSubmitEditing={onVerify}
          />
        </View>
        <Spacer height={16} />

        <View style={styles.row}>
          {bloc.error.code ? (
            <Text style={styles.errorMessage}>{bloc.error.code}</Text>
          ) : (
            <Text style={styles.text}>Didn’t receive a code? </Text>
          )}
          <VSpacer width={4} />

          {bloc.canResend ? (
            <LinkButton
              title="Resend"
              type="primary"
              style={styles.resendBtn}
              textStyle={styles.resendBtnText}
              onPress={onResend}
            />
          ) : (
            <Timer
              prefix={'Resend in '}
              hideIcon
              endTS={bloc.resendAfter}
              textStyle={styles.resendTxt}
              onTimeOut={onTimeOut}
            />
          )}
        </View>
        <Spacer height={-1} />

        <Button title={'Verify'} onPress={onVerify} disabled={isVerifyBtnDisabled} loading={bloc.loading} />
        <Spacer height={24} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const tapTargets = { top: 20, bottom: 20, left: 20, right: 20 }
const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
    paddingBottom: 0,
  },
  avoidContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  codeInputWrapper: {
    marginHorizontal: -6,
  },
  title: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  titleEmail: {
    ...fonts.h1ExtraBold,
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editBtnText: {
    ...fonts.h5SemiBold,
    lineHeight: 20,
    color: colors.text,
    textDecorationLine: 'underline',
  },
  text: {
    color: colors.text,
    ...fonts.h5Regular,
  },
  resendTxt: {
    color: colors.text,
    ...fonts.h5Regular,
    minWidth: 110,
  },
  resendBtn: {
    padding: 0,
  },
  resendBtnText: {
    ...fonts.h5SemiBold,
    lineHeight: 20,
    color: colors.text,
    textDecorationLine: 'underline',
  },
  errorMessage: {
    ...fonts.h5Regular,
    color: colors.danger,
  },
})
