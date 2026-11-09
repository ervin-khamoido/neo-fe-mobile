import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { FlatList, ListRenderItem, StyleSheet, View, Text } from 'react-native'

import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'
import { OutlineButton } from '../../../component/button-v2'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { fonts } from '../../../common/typefaceV2'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import { SavedBankAccountsBLoC } from './saved-bank-accounts.bloc'
import { BankButton } from '../buy/components/bank-button'
import { BankAccount } from '../../../models'
import { Spacer, VSpacer } from '../../../component/spacer'
import { DefaultScreenOptions } from '../../app-header/screen-v2.options'
import { ConfirmDeleteUserBankAccountModal } from './components/confirm-delete-user-bank-modal'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'

export const SavedBankAccountsOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',

  ...DefaultScreenOptions,
}

const keyExtractor = (item: BankAccount) => item.uid

export const SavedBankAccountsScreen = observer(props => {
  const bloc = ioc.useBLoC(SavedBankAccountsBLoC, props)

  const onAddBankAccount = useCallback(() => bloc.onAddBankAccount(), [bloc])
  const handleBankButton = useCallback(item => bloc.onBankAccount(item), [bloc])
  const onDeleteBankAccountsToggle = useCallback(() => bloc.onDeleteBankAccountsToggle(), [bloc])
  const onConfirmDeleteBankAccounts = useCallback(() => bloc.onConfirmDeleteBankAccounts(), [bloc])
  const onSelectBankAccountToDelete = useCallback(item => bloc.onSelectBankAccountsToDelete(item), [bloc])
  const onIsChecked = useCallback(item => bloc.onIsChecked(item), [bloc])
  const onIsDeleting = useCallback(() => bloc.onIsDeleting(), [bloc])

  const title = bloc.isDeleting ? 'Delete Accounts' : 'Bank Accounts'
  const renderItem: ListRenderItem<BankAccount> = ({ item }) => (
    <BankButton
      key={item.bank + item.bankAccountNumberPublic}
      style={styles.btnBank}
      title={item.bankName}
      item={item}
      onBankItem={handleBankButton}
      loading={bloc.loadingBankAccount === item.uid}
      disabled={bloc.loading}
      isDeleting={bloc.isDeleting}
      isChecked={onIsChecked}
      onSelectBankAccountToDelete={onSelectBankAccountToDelete}
    />
  )
  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <View style={styles.row}>
        <Text style={styles.boldText}>{title}</Text>
      </View>
      <Spacer height={40} />

      {!bloc.isDeleting && (
        <View style={styles.row}>
          <OutlineButton
            style={styles.btnAction}
            textStyle={styles.btnTitleStyle}
            title="Add Account"
            onPress={onAddBankAccount}
          >
            <VectorImage style={styles.plusIcon} width={24} height={24} source={PlusIconSrc} />
            <VSpacer width={12} />
          </OutlineButton>
          <VSpacer width={8} />

          {bloc.savedBanksExist && (
            <OutlineButton style={styles.btnDelete} title="" onPress={onIsDeleting}>
              <VectorImage style={styles.btnDeleteIcon} width={24} height={24} source={DeleteIconSrc} />
            </OutlineButton>
          )}
        </View>
      )}

      <FlatList<BankAccount>
        data={bloc.banks}
        extraData={[bloc.loadingBankAccount, bloc.loading, bloc.bankAccountsToDelete]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />

      {bloc.isDeleting && (
        <>
          <Spacer height={19} />
          <OutlineButton title="Cancel" disabled={bloc.loading} onPress={onIsDeleting} />
          <Spacer height={17} />
          <OutlineButton
            style={bloc.disableDelete ? styles.disabledDeleteButton : styles.deleteButton}
            textStyle={bloc.disableDelete ? styles.disableDeleteButtonText : styles.deleteButtonText}
            title=" Delete"
            disabled={bloc.loading || bloc.disableDelete}
            loading={bloc.loading}
            onPress={onDeleteBankAccountsToggle}
          >
            <VectorImage
              style={bloc.disableDelete ? styles.disbledButtonDeleteIcon : styles.buttonDeleteIcon}
              width={24}
              height={24}
              source={DeleteIconSrc}
            />
          </OutlineButton>
          <Spacer height={19} />
        </>
      )}

      <ConfirmDeleteUserBankAccountModal
        isMultiple={bloc.isMultiple}
        visible={bloc.showDeleteModal}
        swipeable={false}
        onBack={onDeleteBankAccountsToggle}
        onConfirm={onConfirmDeleteBankAccounts}
        loading={bloc.loading}
        deleteLoading={bloc.deleteLoading}
      />
      <ModalMonitor
        isVisible={bloc.showDeleteModal}
        hostComponentName="Saved Bank Accounts"
        modalName="Confirm Delete User Bank Account"
      />
    </SafeAreaView>
  )
})

const DeleteIconSrc = require('../../../../assets/images/delete.icon.svg')
const PlusIconSrc = require('../../../../assets/images/plus.icon.svg')

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boldText: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  btnAction: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 23,
    justifyContent: 'flex-start',
    borderRadius: 20,
    borderColor: colors.accent,
  },
  btnTitleStyle: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.accent,
  },
  btnBank: {
    marginVertical: 12,
    borderRadius: 20,
    borderWidth: 0,
    backgroundColor: colors.disabledBackground,
  },
  plusIcon: {
    tintColor: colors.accent,
    width: 24,
    height: 24,
  },
  btnDelete: {
    borderColor: colors.danger,
    width: 64,
    height: 64,
  },
  btnDeleteIcon: {
    tintColor: colors.danger,
    width: 24,
    height: 24,
  },
  deleteButton: {
    borderColor: colors.danger,
    borderWidth: 2.5,
  },
  disabledDeleteButton: {
    borderColor: colors.gray2,
    borderWidth: 2.5,
  },
  deleteButtonText: {
    ...fonts.h3SemiBold,
    color: colors.danger,
  },
  disableDeleteButtonText: {
    ...fonts.h3SemiBold,
    color: colors.gray2,
  },
  buttonDeleteIcon: {
    tintColor: colors.danger,
    width: 24,
    height: 24,
  },
  disbledButtonDeleteIcon: {
    tintColor: colors.gray2,
    width: 24,
    height: 24,
  },
})
