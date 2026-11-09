import React, { useCallback } from 'react'
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'

import { fonts } from '../../../common/typeface'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'

import ioc from '../../../ioc'

import { OutlineButton } from '../../../component/button'
import { BankButton } from '../buy/components/bank-button'
import { SellWithBankBLoC } from './sell-with-bank.bloc'
import { BankAccount } from '../../../models'
import { Spacer, VSpacer } from '../../../component/spacer'

const PlusIconSrc = require('../../../../assets/images/plus.icon.svg')

export const SellWithBankScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

const keyExtractor = (item: BankAccount) => item.uid

export const SellWithBankScreen = observer(props => {
  const bloc = ioc.useBLoC(SellWithBankBLoC, props)

  const onAddBankAccount = useCallback(() => bloc.onAddBankAccount(), [bloc])
  const handleBankButton = useCallback(item => bloc.handleBankButton(item), [bloc])

  const renderItem: ListRenderItem<BankAccount> = ({ item }) => (
    <BankButton
      key={item.bank + item.bankAccountNumberPublic}
      style={styles.btnBank}
      title={item.bankName}
      item={item}
      onBankItem={handleBankButton}
      loading={bloc.loadingBankAccount === item.uid}
      disabled={bloc.loading}
    />
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <View style={styles.row}>
        <Text style={styles.boldText}>Select an account</Text>
      </View>
      <Spacer height={8} />

      <View style={styles.row}>
        <Text style={styles.subHeading}>Select the account you would like to use for the bank transfer</Text>
      </View>
      <Spacer height={40} />

      <OutlineButton
        style={styles.btnAction}
        title="Add Account"
        onPress={onAddBankAccount}
        loading={bloc.addBankLoading}
        disabled={bloc.addBankLoading}
      >
        <VectorImage style={styles.plusIcon} width={20} height={20} source={PlusIconSrc} />
        <VSpacer width={12} />
      </OutlineButton>

      <FlatList<BankAccount>
        data={bloc.banks}
        extraData={[bloc.loadingBankAccount, bloc.loading]}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </SafeAreaView>
  )
})

const Edges: Edge[] = ['bottom']

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boldText: {
    ...fonts.h1SemiBold,
    lineHeight: 32,
    color: colors.text,
  },
  subHeading: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  btnAction: {
    paddingHorizontal: 24,
    paddingVertical: 25,
    justifyContent: 'flex-start',
    borderRadius: 20,
    borderColor: colors.gray5,
  },
  btnBank: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.disabledBackground,
  },
  plusIcon: {
    tintColor: colors.textLabel,
    width: 20,
    height: 20,
  },
})
