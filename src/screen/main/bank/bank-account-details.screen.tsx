import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'

import { colors } from '../../../common/constrants'
import { Spacer } from '../../../component/spacer'
import { BankAccountDetailsBLoC } from './bank-account-details.bloc'
import { OutlineButton } from '../../../component/button'
import VectorImage from 'react-native-vector-image'
import { ConfirmDeleteUserBankAccountModal } from '../tabs/components/confirm-delete-user-bank-modal'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

export const BankAccountDetailsScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Bank Details',
}

export const BankAccountDetailsScreen = memo(props => {
  const bloc = ioc.useBLoC(BankAccountDetailsBLoC, props)
  const onDeleteBankAccountsToggle = useCallback(() => bloc.onDeleteBankAccountsToggle(), [bloc])
  const onConfirmDeleteBankAccounts = useCallback(() => bloc.onConfirmDeleteBankAccounts(), [bloc])

  return (
    <Observer>
      {() => (
        <SafeAreaView style={styles.container} edges={Edges}>
          <View>
            <Spacer height={24} />

            <Text style={styles.label}>Beneficiary Name</Text>
            <Spacer height={4} />
            <Text style={styles.value}>{bloc.beneficiaryName}</Text>
            <Spacer height={28} />

            <Text style={styles.label}>Bank Name</Text>
            <Spacer height={4} />
            <Text style={styles.value}>{bloc.bankAccount?.bankName}</Text>
            <Spacer height={28} />

            <Text style={styles.label}>Bank Account Number</Text>
            <Spacer height={4} />
            <Text style={styles.value}>{bloc.bankAccount?.bankAccountNumberPublic}</Text>
          </View>
          <View>
            <OutlineButton
              style={styles.deleteButton}
              textStyle={styles.deleteButtonText}
              title=" Delete"
              onPress={onDeleteBankAccountsToggle}
            >
              <VectorImage style={styles.buttonDeleteIcon} width={24} height={24} source={DeleteIconSrc} />
            </OutlineButton>
            <Spacer height={19} />
          </View>

          <ConfirmDeleteUserBankAccountModal
            visible={bloc.showDeleteModal}
            swipeable={false}
            onBack={onDeleteBankAccountsToggle}
            onConfirm={onConfirmDeleteBankAccounts}
            deleteLoading={bloc.deleteLoading}
          />
          <ModalMonitor
            isVisible={bloc.showDeleteModal}
            hostComponentName="Bank Account Details"
            modalName="Confirm Delete User Bank Account"
          />
        </SafeAreaView>
      )}
    </Observer>
  )
})

const DeleteIconSrc = require('../../../../assets/images/delete.icon.svg')

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.margin,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },

  label: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  value: {
    ...fonts.h1SemiBold,
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

  buttonDeleteIcon: {
    tintColor: colors.danger,
    width: 24,
    height: 24,
  },
})
