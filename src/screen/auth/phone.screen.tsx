import React, { useCallback } from 'react'
import { StyleSheet, Text, Linking, Platform, KeyboardAvoidingView, TouchableOpacity, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context'

import ioc from '../../ioc'

import { sizes, TERMS_AND_CONDITIONS } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { Button } from '../../component/button-v2'

import { PhoneBLoC } from './phone.bloc'

import { PhoneInput } from '../../component/form/input-v2'
import { Field } from '../../component/form/field'
import { Spacer, VSpacer } from '../../component/spacer'
import { fonts } from '../../common/typefaceV2'
import { CheckboxInput } from '../../component/form/checkbox-input'
import { PhoneVerificationType } from '../../services/api.service'

export const PhoneScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  headerBackTitle: '',
  animationEnabled: false,
}

export const PhoneScreen = observer(props => {
  const bloc = ioc.useBLoC(PhoneBLoC, props)

  const onSignIn = useCallback(() => bloc.onSignIn(), [bloc])
  const onPhoneChange = useCallback((name, value) => bloc.onPhoneChange(name, value), [bloc])
  const handlePress = useCallback(() => {
    Linking.openURL(TERMS_AND_CONDITIONS)
  }, [])
  const onPhoneSMSVerification = useCallback(() => bloc.onPhoneVerification(PhoneVerificationType.SMS), [bloc])
  const onPhoneWhatsAppVerification = useCallback(
    () => bloc.onPhoneVerification(PhoneVerificationType.WhatsApp),
    [bloc],
  )

  return (
    <SafeAreaView style={styles.safeContainer} edges={Edges}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        enabled={Platform.OS === 'ios'}
        behavior={'padding'}
        keyboardVerticalOffset={sizes.headerHeightV2 + initialWindowMetrics.insets.top}
      >
        <Spacer height={44} />
        <Text style={styles.title}>Enter your phone number</Text>
        <Spacer height={24} />
        <Field error={bloc.error.phone}>
          <PhoneInput
            name="phone"
            value={bloc.data.phone}
            onChange={onPhoneChange}
            autoFocus
            forwardRef={bloc.phoneRef}
            placeholder="Phone number"
            placeholderTextColor={colors.text}
          />
        </Field>

        <Spacer height={24} />

        <View style={styles.channels}>
          {bloc.whatsappVerificationActive && (
            <>
              <View style={styles.channel}>
                <CheckboxInput
                  style={styles.channelCheckbox}
                  label="Via WhatsApp"
                  labelStyle={styles.channelLabel}
                  name="verification"
                  value={bloc.data.type === PhoneVerificationType.WhatsApp}
                  onChange={onPhoneWhatsAppVerification}
                />
              </View>

              <VSpacer width={24} />
            </>
          )}

          <View style={styles.channel}>
            <CheckboxInput
              disabled={!bloc.whatsappVerificationActive}
              style={styles.channelCheckbox}
              label="Via SMS"
              labelStyle={styles.channelLabel}
              name="verification"
              value={bloc.data.type === PhoneVerificationType.SMS}
              onChange={onPhoneSMSVerification}
            />
          </View>
        </View>

        <Spacer height={-1} />

        <TouchableOpacity onPress={handlePress}>
          <Text style={styles.termsText}>
            By signing up you agree to our <Text style={styles.termsAccentText}>Terms and Conditions</Text>
          </Text>
        </TouchableOpacity>
        <Spacer height={24} />

        <Button title={'Next'} onPress={onSignIn} disabled={bloc.loading} loading={bloc.loading} />
        <Spacer height={24} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  wrapper: {
    flexGrow: 1,
    paddingHorizontal: sizes.marginV2,
  },
  title: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  termsText: {
    textAlign: 'center',
    ...fonts.h6Regular,
    lineHeight: 20,
    color: colors.textLabel,
  },
  termsAccentText: {
    ...fonts.h6Regular,
    lineHeight: 20,
    color: colors.accent,
    textDecorationLine: 'underline',
  },

  channels: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  channel: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelCheckbox: {
    width: 24,
    height: 24,
  },
  channelLabel: {
    ...fonts.h4Regular,
    lineHeight: 24,
    marginLeft: 8,
  },
})
