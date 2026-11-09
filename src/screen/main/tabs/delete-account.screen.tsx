import React, { memo, useCallback } from 'react'
import { Observer } from 'mobx-react-lite'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'
import { DeleteAccountBLoC } from './delete-account.bloc'
import { SafeAreaView } from 'react-native-safe-area-context'
import { fonts } from '../../../common/typeface'
import { Spacer } from '../../../component/spacer'
import { OutlineButton } from '../../../component/button'
import VectorImage from 'react-native-vector-image'
import { ConfirmDeleteAccountModal } from './components/confirm-delete-account-modal'
import { DeleteValidateErrorModal } from './components/delete-validate-error.modal'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'

export const DeleteAccountScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Delete Neobank Account',
}

export const DeleteAccountScreen = memo(props => {
  const bloc = ioc.useBLoC(DeleteAccountBLoC, props)
  const onCancel = useCallback(() => bloc.onCancel(), [bloc])
  const onDeleteAccount = useCallback(() => bloc.onDeleteAccount(), [bloc])
  const onConfirmDeleteAccountToggle = useCallback(() => bloc.onConfirmDeleteAccountToggle(), [bloc])
  const onConfirmDeleteAccount = useCallback(() => bloc.onConfirmDeleteAccount(), [bloc])
  const onCancelDeleteValidateErrorModal = useCallback(() => bloc.onCancelDeleteValidateErrorModal(), [bloc])
  const onSellOutstandingBalanceModal = useCallback(() => bloc.onSell(), [bloc])

  return (
    <Observer>
      {() => (
        <>
          <SafeAreaView style={styles.container}>
            <Spacer height={28} />

            <Text style={styles.header}>Deleting your account will cause the following:</Text>
            <Spacer height={16} />

            {DeleteAccountList.map((text, index) => (
              <View key={index} style={styles.listEntry}>
                <Text style={styles.listNumber}>{index + 1}.</Text>
                <Text style={styles.listText}>{text}</Text>
              </View>
            ))}

            <Spacer height={-1} />

            <OutlineButton textStyle={styles.buttonText} title="Cancel" disabled={bloc.loading} onPress={onCancel} />
            <Spacer height={15} />
            <OutlineButton
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              indicatorColor={colors.danger}
              title=" Delete Neobank Account"
              disabled={bloc.loading}
              loading={bloc.loading}
              onPress={onDeleteAccount}
            >
              <VectorImage style={styles.deleteIcon} width={24} height={24} source={DeleteIconSrc} />
            </OutlineButton>
            <Spacer height={37} />
          </SafeAreaView>

          <ConfirmDeleteAccountModal
            loading={bloc.loading}
            visible={bloc.showConfirmDeleteAccountModal}
            swipeable={true}
            onBack={onConfirmDeleteAccountToggle}
            onConfirm={onConfirmDeleteAccount}
            onBackdropPress={onConfirmDeleteAccountToggle}
          />
          <ModalMonitor
            isVisible={bloc.showConfirmDeleteAccountModal}
            hostComponentName="Delete Neobank Account Screen"
            modalName="Confirm Delete Neobank Account"
          />

          <DeleteValidateErrorModal
            visible={bloc.showDeleteValidateErrorModal}
            loading={bloc.loading}
            swipeable={true}
            errorCTAs={bloc.deleteValidateErrorCTAs}
            errorBtn={bloc.deleteValidateErrorBtn}
            onBack={onCancelDeleteValidateErrorModal}
            onConfirm={onSellOutstandingBalanceModal}
            onBackdropPress={onCancelDeleteValidateErrorModal}
            onSwipeDown={onCancelDeleteValidateErrorModal}
          />
          <ModalMonitor
            isVisible={bloc.showDeleteValidateErrorModal}
            hostComponentName="Delete Neobank Account Screen"
            modalName="Outstanding Balance"
          />
        </>
      )}
    </Observer>
  )
})

const DeleteIconSrc = require('../../../../assets/images/delete.icon.svg')

const DeleteAccountList = [
  'Your account will be closed however we will keep your information on record for a retention period of 5 years as required by our regulator.',
  'All trading capacities for your account will be disabled.',
  'You can register a new account in the future.',
]

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
    height: '100%',
  },
  header: {
    color: colors.text,
    ...fonts.h3SemiBold,
  },
  listEntry: {
    flexDirection: 'row',
    paddingHorizontal: 3,
  },
  listNumber: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'left',
    width: 24,
  },
  listText: {
    flex: 1,
    ...fonts.h3Regular,
    color: colors.text,
  },
  buttonText: {
    ...fonts.h3SemiBold,
    color: colors.text,
  },
  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
  },
  deleteButtonText: {
    ...fonts.h3SemiBold,
    color: colors.danger,
  },
  deleteIcon: {
    tintColor: colors.danger,
    width: 24,
    height: 24,
  },
})
