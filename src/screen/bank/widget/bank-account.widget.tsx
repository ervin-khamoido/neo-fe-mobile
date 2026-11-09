import React, { memo, useCallback, useMemo } from 'react'
import LottieView from 'lottie-react-native'
import { StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'
import { BankAccountWidgetMode } from '../../common'

import { Input } from '../../../component/form/input'
import { Button, LinkButton } from '../../../component/button'
import { Field } from '../../../component/form/field'
import { Spacer } from '../../../component/spacer'
import { SignUpHeader } from '../../auth/components/sign-up-header'

import { ConfirmationModal } from '../components/confirmation.modal'
import { NoMatchModal } from '../components/no-match.modal'
import { AddBankAccountDisclaimer } from '../components/disclaimer'

import { SelectWidget } from '../../../widget/select.widget'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'

import { BankAccountBLoC } from './bank-account.bloc'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export type BankAccountWidgetProps = {
  mode: BankAccountWidgetMode
  ctaBtnTitle: string

  onSubmit: (uid: string) => unknown
  onCancel: () => void
}
export const BankAccountWidget = memo<BankAccountWidgetProps>(props => {
  const bloc = ioc.useBLoC(BankAccountBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onToggleRegisterName = useCallback(() => bloc.onToggleRegisterName(), [bloc])
  const onToggleNotEditableName = useCallback(() => bloc.onToggleNotEditableName(), [bloc])

  const titleSelector = useCallback(x => x?.name, [])
  const valueSelector = useCallback(x => x.uid, [])
  const searchHandler = useCallback(
    (search, items) => items.filter(x => x.name.toLowerCase().includes(search.toLowerCase())),
    [],
  )

  const onConfirmationBack = useCallback(() => bloc.onConfirmationBack(), [bloc])
  const onConfirmationConfirm = useCallback(() => bloc.onConfirmationConfirm(), [bloc])

  const onNoMatchCancel = useCallback(() => bloc.onNoMatchCancel(), [bloc])
  const onNoMatchEdit = useCallback(() => bloc.onNoMatchEdit(), [bloc])
  const onAnimationFinished = useCallback(() => bloc.onAnimationFinished(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <KeyboardAwareScrollView style={styles.avoidContainer} contentContainerStyle={styles.innerContainer}>
            {bloc.showGeneralHeader && (
              <>
                {/*<Spacer height={10} />*/}
                <Text style={styles.boldHeader}>Enter bank account details</Text>
                <Spacer height={12} />
              </>
            )}

            {bloc.showAuthHeader && (
              <>
                <SignUpHeader step={3} steps={3} title="Bank Details" />
                <Spacer height={24} />
                <Text style={styles.justOneStep}>Just one step away</Text>
                <Spacer height={9} />
                <Text style={styles.pleaseEnterBankAcc}>
                  Please enter your own bank account details. This is required to do transactions in Nigeria.
                </Text>
              </>
            )}

            {bloc.fullNameExists && (
              <View>
                <Text style={styles.belongsToLabel}>Ensure this bank account belongs to -</Text>
                <Text style={styles.belongsTo}>{bloc.fullName}</Text>
              </View>
            )}
            <Spacer height={28} />

            <Field error={bloc.error.bank}>
              <SelectWidget
                items={bloc.banks}
                name="bank"
                value={bloc.data.bank}
                onChange={onChange}
                placeholder={'Please Select a Bank'}
                titleSelector={titleSelector}
                valueSelector={valueSelector}
                searchHandler={searchHandler}
              />
            </Field>
            <Spacer height={44} />

            <Field error={bloc.error.bankAccountNumber || bloc.formError}>
              <Input
                forwardRef={bloc.accountNumberRef}
                name={'bankAccountNumber'}
                onChange={onChange}
                placeholder={'Bank Account Number'}
                editable={!bloc.loading}
                keyboardType={'numeric'}
              />
            </Field>
            <AddBankAccountDisclaimer disclaimer={bloc.disclaimerText} />
            <Spacer height={-1} />

            <View style={styles.lottieContainer}>
              <LottieView
                ref={bloc.lottieViewRef}
                style={styles.lottie}
                source={FinishSignUpAnimation}
                loop={false}
                autoPlay={false}
                onAnimationFinish={onAnimationFinished}
              />
            </View>
            <Spacer height={-1} />

            {bloc.showSkipButton && <LinkButton title={'Add Bank Account Later'} onPress={onConfirmationBack} />}

            <Button title={bloc.submitBtnTitle} loading={bloc.loading} disabled={bloc.loading} onPress={onSubmit} />
            <Spacer height={26} />

            <ModalMonitor
              isVisible={!!bloc.formError}
              hostComponentName="AddBankAccountScreen"
              modalName="Bank Account Error"
            />

            <ConfirmationModal
              visible={bloc.showConfirmationModal}
              swipeable={false}
              fullName={bloc.validationResult?.fullName ?? 'Unknown'}
              loading={bloc.loading}
              onBack={onConfirmationBack}
              onConfirm={onConfirmationConfirm}
              toggleRegisterName={bloc.showRegisterNameModal}
              toggleUnchangeName={bloc.showNotEditableNameModal}
              onToggleRgister={onToggleRegisterName}
              onToggleUnchange={onToggleNotEditableName}
              onBackdropPress={onConfirmationBack}
            />
            <ModalMonitor
              isVisible={bloc.showConfirmationModal}
              hostComponentName="AddBankAccountScreen"
              modalName="Bank Account Confirmation"
            />

            {!!bloc.fullName && (
              <>
                <NoMatchModal
                  visible={bloc.showNoMatchModal}
                  fullName={bloc.fullName}
                  swipeable={false}
                  onCancel={onNoMatchCancel}
                  onEdit={onNoMatchEdit}
                />
                <ModalMonitor
                  isVisible={bloc.showNoMatchModal}
                  hostComponentName="Add Bank Account Screen"
                  modalName="Bank Account No Match"
                />
              </>
            )}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      )}
    </Observer>
  )
})

const Edges: Edge[] = ['bottom']

const FinishSignUpAnimation = require('../../../../assets/animations/done-extra-circle.json')

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avoidContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  innerContainer: {
    flexGrow: 1,
    paddingHorizontal: sizes.margin,
    backgroundColor: colors.background,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryColor: {
    color: colors.primary,
  },
  dropdownItemStyle: {
    padding: 10,
    marginTop: 2,
    backgroundColor: colors.disabled,
  },
  dropdownTextInputPropsStyle: {
    borderBottomWidth: 1,
    borderColor: colors.border,
    fontWeight: '400',
    fontSize: 25,
  },
  boldHeader: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  bold: {
    ...fonts.h5SemiBold,
    color: colors.text,
  },
  disclaimer: {
    ...fonts.h5Regular,
    color: colors.text,
    marginBottom: 80,
  },
  checkboxText: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 28,
    color: colors.input,
  },
  checkboxRow: {
    marginBottom: 15,
    flexDirection: 'row',
  },
  nameText: {
    marginVertical: 10,
    color: colors.primary,
    fontSize: 24,
    lineHeight: 36,
  },

  justOneStep: {
    ...fonts.h1Bold,
    color: colors.text,
  },
  pleaseEnterBankAcc: {
    ...fonts.h5Regular,
    color: colors.text,
  },

  belongsToLabel: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  belongsTo: {
    ...fonts.h4SemiBold,
    color: colors.primary,
  },

  lottieContainer: {
    flex: 0,
    alignItems: 'center',
  },

  lottie: {
    width: 120,
    height: 120,
  },
})
