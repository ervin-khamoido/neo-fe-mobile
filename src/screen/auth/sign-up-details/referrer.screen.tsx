import React, { useCallback } from 'react'
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'

import { colors, sizes } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'

import { Button, OutlineButton } from '../../../component/button-v2'
import { Input } from '../../../component/form/input-v2'
import { Field } from '../../../component/form/field'
import { Spacer } from '../../../component/spacer'

import { ReferrerBLoC } from './referrer.bloc'
import { ButtonStyles } from '../../../component/common'
import { ConfirmModal } from './confirm-modal'

export const ReferrerScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
  headerBackTitle: '',
  animationEnabled: true,
}

export const ReferrerScreen = observer(props => {
  const bloc = ioc.useBLoC(ReferrerBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onSkip = useCallback(() => bloc.onSkip(), [bloc])
  const onModalOpen = useCallback(() => bloc.onModalOpen(), [bloc])
  const onModalClose = useCallback(() => bloc.onModalClose(), [bloc])

  return (
    <SafeAreaView style={styles.wrapper} edges={Edges}>
      <KeyboardAvoidingView style={styles.avoiding} enabled={Platform.OS === 'ios'} behavior={'padding'}>
        <Text style={styles.referrerText}>Have a referral code? </Text>
        <Text style={styles.referrerSubText}>If you have a referral code, you can enter it below.</Text>
        <View style={styles.referrerTextWrapper}>
          <Field error={bloc.error.referrerCode}>
            <Input
              name="referrerCode"
              value={bloc.data?.referrerCode}
              onChange={onChange}
              autoCapitalize="characters"
              placeholder="Enter referral code here"
              editable={!bloc.loading}
            />
          </Field>
        </View>

        <Spacer height={-1} />

        <OutlineButton
          style={styles.btnOutlined}
          textStyle={styles.btnTxt}
          title="Skip"
          disabled={bloc.loading}
          loading={bloc.loading}
          onPress={onModalOpen}
        />

        <Spacer height={16} />

        <Button
          textStyle={styles.btnTxt}
          title="Next"
          contentPosition="right"
          disabled={bloc.loading}
          loading={bloc.loading}
          onPress={onSubmit}
        />

        <Spacer height={24} />

        <ConfirmModal
          visible={bloc.isConfirmModalVisible}
          title="Are you sure you don't have a referral code?"
          onConfirm={onSkip}
          onCancel={onModalClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avoiding: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },
  referrerTextWrapper: {
    marginTop: 30,
  },
  referrerText: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  referrerSubText: {
    ...fonts.h5Regular,
    color: colors.text,
  },
  btnOutlined: {
    // TODO: try fixing it globally. Determine the impact
    padding: ButtonStyles.container.padding,
  },
  btnTxt: {
    ...fonts.h3Regular,
  },
})
