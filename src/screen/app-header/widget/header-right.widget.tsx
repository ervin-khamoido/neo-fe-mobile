import React, { useCallback } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import VectorImage from 'react-native-vector-image'
import { observer } from 'mobx-react-lite'
import { useRoute } from '@react-navigation/native'

import { sizes } from '../../../common/constrants'
import ioc from '../../../ioc'

import { HeaderRightBLoC } from './header-right.bloc'
import { colors } from '../../../common/colorV2'

const InfoIconSrc = require('../../../../assets/images/info-bold.icon.svg')
const UserIconSrc = require('../../../../assets/images/user-v2.icon.svg')

export const HeaderRightWidget = observer(props => {
  const bloc = ioc.useBLoC(HeaderRightBLoC, props)

  // TODO: move to useBLoC
  const { name } = useRoute() // current route name

  const onInfo = useCallback(() => bloc.onInfo(), [bloc])
  const onAccountPage = useCallback(() => bloc.onAccountPage(), [bloc])

  const isAccountBtnShown = ['Wallet', 'Card'].includes(name)
  const isInfoBtnShown = [
    'Bvn',
    'CardAmount',
    'Amount',
    'Totals',
    'PayWithBank',
    'BankTransfer',
    'SellWithBank',
    'SellConfirmation',
    'RewardTopic',
    'SendOnChainConfirm',
    'Lock',
    'SasDetails',
  ].includes(name)

  //TODO
  const falseToolTipsTillImplemented = false
  return (
    <TouchableOpacity style={styles.btn} onPress={onInfo}>
      {falseToolTipsTillImplemented && (
        <VectorImage style={styles.infoIcon} width={24} height={24} source={InfoIconSrc} />
      )}

      {isAccountBtnShown && (
        <TouchableOpacity onPress={onAccountPage}>
          {bloc.hasUnreadFreshchat && <View style={styles.unreadBadge} />}
          <VectorImage style={styles.userIcon} width={28} height={28} source={UserIconSrc} />
        </TouchableOpacity>
      )}

      {isInfoBtnShown && (
        <TouchableOpacity onPress={onAccountPage}>
          <VectorImage style={styles.infoIcon} width={24} height={24} source={InfoIconSrc} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: sizes.marginV2,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    backgroundColor: colors.danger2,
    borderRadius: 8,
    top: 0,
    left: 0,
  },
  infoIcon: {
    width: 24,
    height: 24,
  },
  userIcon: {
    width: 28,
    height: 28,
  },
})
