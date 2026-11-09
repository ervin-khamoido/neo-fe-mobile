import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { colors } from '../../../../common/constrants'
import { Activity, CardOrderType, ICardOrderDetails } from '../../../../models'
import { fonts } from '../../../../common/typeface'
import { Spacer } from '../../../../component/spacer'
import { MiscStyles as MiscStylesV2 } from '../../../../component/common-v2'
import { CopiableTextWidget } from '../../tabs/widget/copiable-text.widget'

interface CardTransactionInfoProps {
  item: Activity
}
export const CardTransactionInfo = observer<CardTransactionInfoProps>(({ item }) => {
  const details = item.details as ICardOrderDetails
  const { orderType } = details

  return (
    <View>
      <View style={styles.solidLine} />
      <Spacer height={20} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Transaction Type</Text>
        <Text style={styles.infoRightText}>{renderTransactionTypeTitle(orderType)}</Text>
      </View>
      <Spacer height={20} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Order Number</Text>
        <CopiableTextWidget copyText={item?.orderReferenceNumber}>
          <Text style={styles.infoRightText}>{item?.orderReferenceNumber}</Text>
        </CopiableTextWidget>
      </View>
      <Spacer height={20} />

      {orderType !== CardOrderType.Fee && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Transaction Mode</Text>
            <Text style={styles.infoRightText}>{renderTransactionModeTitle(orderType)}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      {[CardOrderType.Unload, CardOrderType.Fund, CardOrderType.Fee].includes(orderType) && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>{paymentReferenceTitle[orderType]}</Text>
            <Text style={styles.infoRightText}>Primary Wallet</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      {CardOrderType.SpendFee === orderType && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>{paymentReferenceTitle[orderType]}</Text>
            <Text style={styles.infoRightText}>Card</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      {(details.orderType === CardOrderType.Fund || details.orderType === CardOrderType.Spend) && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Fees</Text>
            <Text style={styles.infoRightText}>{details.feeFormatted}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      <View style={styles.solidLine} />
    </View>
  )
})

const renderTransactionTypeTitle = (itemType: CardOrderType) => {
  switch (itemType) {
    case CardOrderType.Unload:
      return 'Unload Card'
    case CardOrderType.Fund:
      return 'Fund Card'
    case CardOrderType.Fee:
      return 'Creation Fees'
    case CardOrderType.SpendFee:
      return 'Transaction Fee'
    case CardOrderType.Reversal:
      return 'Reversal'
    default:
      return 'Online Purchase'
  }
}

const renderTransactionModeTitle = (itemType: CardOrderType) => {
  switch (itemType) {
    case CardOrderType.Reversal:
      return 'Credit'
    default:
      return 'Debit'
  }
}

const paymentReferenceTitle = {
  [CardOrderType.Unload]: 'To',
  [CardOrderType.Fund]: 'From',
  [CardOrderType.Fee]: 'From',
  [CardOrderType.SpendFee]: 'From',
}

const styles = StyleSheet.create({
  solidLine: {
    ...MiscStylesV2.solidLine2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLeftText: {
    ...fonts.h4Regular,
    color: colors.textSecondaryDark,
  },
  infoRightText: {
    ...fonts.h4PreSemiBold,
    color: colors.text,
  },
})
