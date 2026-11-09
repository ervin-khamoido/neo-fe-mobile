import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import { fonts } from '../../../../common/typefaceV2'
import { colors } from '../../../../common/colorV2'

import { Activity, ActivityType } from '../../../../models'
import { Spacer } from '../../../../component/spacer'
import { CopiableTextWidget } from '../../tabs/widget/copiable-text.widget'
import { MiscStyles } from '../../../../component/common'
import { formatUsername } from '../../../../utils/helpers'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'

type TransactionInfoProps = {
  item: Activity
}

export const TransactionInfo = observer<TransactionInfoProps>(props => {
  const { item } = props

  return (
    <>
      <View style={styles.solidLine} />
      <Spacer height={16} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Transaction Type</Text>
        <Text style={styles.transactionTypeText}>{renderTransactionTypeTitle[item.details.type]}</Text>
      </View>
      <Spacer height={16} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Order Number</Text>

        <CopiableTextWidget style={styles.text} copyText={item?.orderReferenceNumber} showCopyIcon>
          {item?.orderReferenceNumber}
        </CopiableTextWidget>
      </View>
      <Spacer height={20} />

      {(item.details.type === ActivityType.Buy || item.details.type === ActivityType.Sell) && (
        <>
          {!!item.details.userBankAccountNumber && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Bank Account</Text>
                <Text style={styles.text}>{item.details.userBankAccountNumber}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}
        </>
      )}

      {item.details.type === ActivityType.Buy && (
        <>
          {!!item.amount && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>You Transferred</Text>
                <Text style={styles.text}>{formatCurrency(item.amount ?? 0, CurrencyCode.NGN, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.details.fee && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Fees</Text>
                <Text style={styles.text}>{formatCurrency(item.details.fee ?? 0, CurrencyCode.NGN, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.details.exchangeRate && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Exchange Rate</Text>
                <Text style={styles.text}>
                  {formatCurrency(item.details.exchangeRate ?? 0, CurrencyCode.NGN, false)} / $1.00
                </Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          <View style={styles.solidLine} />
          <Spacer height={20} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Amount Credited</Text>
            <Text style={styles.textBold}>{formatCurrency(item.amountUsdc ?? 0, CurrencyCode.USD, false)}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      {item.details.type === ActivityType.Sell && (
        <>
          {!!item.details.amountUsdc && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Amount Withdrawn</Text>
                <Text style={styles.text}>{formatCurrency(item.details.amountUsdc ?? 0, CurrencyCode.USD, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.details.exchangeRate && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Exchange Rate</Text>
                <Text style={styles.text}>
                  {formatCurrency(item.details.exchangeRate ?? 0, CurrencyCode.NGN, false)} / $1.00
                </Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.details.amount && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Amount Withdrawn</Text>
                <Text style={styles.text}>{formatCurrency(item.details.amount ?? 0, CurrencyCode.NGN, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.details.fee && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>Fees</Text>
                <Text style={styles.text}>{formatCurrency(item.details.fee ?? 0, CurrencyCode.NGN, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}

          {!!item.amount && (
            <>
              <View style={styles.solidLine} />
              <Spacer height={20} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLeftText}>You Got</Text>
                <Text style={styles.textBold}>{formatCurrency(item.amount ?? 0, CurrencyCode.NGN, false)}</Text>
              </View>
              <Spacer height={20} />
            </>
          )}
        </>
      )}

      {'senderUsername' in item.details && !!item.details.senderUsername && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Sender Username</Text>
            <Text style={styles.text}>{formatUsername(item.details.senderUsername)}</Text>
          </View>
          <Spacer height={16} />
        </>
      )}

      {'senderDisplayName' in item.details && !!item.details.senderDisplayName && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Sender Fullname</Text>
            <Text style={styles.text}>{item.details.senderDisplayName}</Text>
          </View>
          <Spacer height={16} />
        </>
      )}

      {'receiverDisplayName' in item.details && !!item.details.receiverDisplayName && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Receiver Username</Text>
            <Text style={styles.text}>{formatUsername(item.details.receiverUsername)}</Text>
          </View>
          <Spacer height={16} />
        </>
      )}

      {'receiverUsername' in item.details && !!item.details.receiverUsername && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Receiver Fullname</Text>
            <Text style={styles.text}>{item.details.receiverDisplayName}</Text>
          </View>
          <Spacer height={16} />
        </>
      )}

      <View style={styles.solidLine} />
      <Spacer height={20} />
    </>
  )
})

const renderTransactionTypeTitle = {
  [ActivityType.Yield]: 'Monthly Interest',
  [ActivityType.Buy]: 'Deposit',
  [ActivityType.Sell]: 'Withdrawal',
  [ActivityType.Transfer_Send]: 'Send',
  [ActivityType.Transfer_Receive]: 'Receive',
}

const styles = StyleSheet.create({
  solidLine: {
    ...MiscStyles.solidLine,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLeftText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  text: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  textBold: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  amountCreditedUsd: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  transactionTypeText: {
    ...fonts.h4PreSemiBold,
    backgroundColor: colors.accent,
    color: colors.input,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: 'hidden',
    borderRadius: 16,
  },
})
