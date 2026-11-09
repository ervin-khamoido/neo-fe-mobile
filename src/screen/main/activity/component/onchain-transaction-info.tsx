import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { upperFirst } from 'lodash'
import VectorImage from 'react-native-vector-image'

import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { OnChainNetworkIcon, OnChainNetworkTitle, OnChainTokenIcon, OnChainTokenTitle } from '../common'
import { Activity, IOnChainOrderDetails, OnChainOrderActivityStatus, OnChainOrderType } from '../../../../models'

import { Spacer, VSpacer } from '../../../../component/spacer'
import { MiscStyles } from '../../../../component/common-v2'
import { CopiableTextWidget } from '../../tabs/widget/copiable-text.widget'
import { cutMiddleOfString } from '../../../../utils/helpers'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { CurrencyCode } from '../../../../common/constrants'

interface OnChainTransactionInfoProps {
  item: Activity
}
export const OnChainTransactionInfo = observer<OnChainTransactionInfoProps>(({ item }) => {
  const details = item.details as IOnChainOrderDetails
  const { orderType } = details

  const fromAddress = useMemo(() => cutMiddleOfString(details.fromAddress), [details])
  const toAddress = useMemo(() => cutMiddleOfString(details.toAddress), [details])

  const transactionTypeRightTextStyles = useMemo(() => [styles.badge, styles.successStatus], [])
  const statusRightTextCompletedStyles = useMemo(() => [styles.badge, styles.successStatus], [])
  const statusRightTextPendingStyles = useMemo(() => [styles.badge, styles.pendingStatus], [])
  const statusRightTextFailedStyles = useMemo(() => [styles.badge, styles.failStatus], [])
  const statusRightTextQuarantineStyles = useMemo(() => [styles.badge, styles.pendingStatus], [])

  const statusRightTextStyles = {
    [OnChainOrderActivityStatus.Completed]: statusRightTextCompletedStyles,
    [OnChainOrderActivityStatus.Failed]: statusRightTextFailedStyles,
    [OnChainOrderActivityStatus.Pending]: statusRightTextPendingStyles,
    [OnChainOrderActivityStatus.Quarantine]: statusRightTextQuarantineStyles,
  }[item.status]

  return (
    <View>
      <View style={styles.solidLine} />
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Transaction Type</Text>
        <View style={transactionTypeRightTextStyles}>
          <Text style={styles.badgeTxt}>{renderTransactionTypeTitle(orderType)}</Text>
        </View>
      </View>
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Status</Text>
        <View style={statusRightTextStyles}>
          <Text style={styles.badgeTxt}>{upperFirst(item.status)}</Text>
        </View>
      </View>
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Token</Text>
        <View style={styles.infoRightTextContainer}>
          <VectorImage style={styles.tokenIcon} width={24} height={24} source={OnChainTokenIcon[details.coin]} />
          <VSpacer width={4} />
          <Text style={styles.infoRightText}>{OnChainTokenTitle[details.coin]}</Text>
        </View>
      </View>
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Network</Text>
        <View style={styles.infoRightTextContainer}>
          <VectorImage style={styles.tokenIcon} width={24} height={24} source={OnChainNetworkIcon[details.baseCoin]} />
          <VSpacer width={4} />
          <Text style={styles.infoRightText}>{OnChainNetworkTitle[details.baseCoin]}</Text>
        </View>
      </View>
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>Order Number</Text>
        <CopiableTextWidget copyText={item.orderReferenceNumber} showCopyIcon>
          <Text style={styles.infoRightText}>{item.orderReferenceNumber}</Text>
        </CopiableTextWidget>
      </View>
      <Spacer height={20} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>From</Text>
        <CopiableTextWidget copyText={details.fromAddress} showCopyIcon>
          <Text style={styles.infoRightText}>{fromAddress}</Text>
        </CopiableTextWidget>
      </View>
      <Spacer height={20} />
      <View style={styles.infoRow}>
        <Text style={styles.infoLeftText}>To</Text>
        <CopiableTextWidget copyText={details.toAddress} showCopyIcon>
          <Text style={styles.infoRightText}>{toAddress}</Text>
        </CopiableTextWidget>
      </View>
      <Spacer height={20} />

      {details.orderType === OnChainOrderType.Send && (
        <>
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Neobank Fees</Text>
            <VSpacer width={-1} />
            <Text style={styles.infoRightText}>
              {formatCurrency(details.fees.neobankFeeUsdc, CurrencyCode.USD, false)}
            </Text>
          </View>
          <Spacer height={20} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Network Fees</Text>
            <VSpacer width={-1} />
            <Text style={styles.infoRightText}>
              {formatCurrency(details.fees.networkFeeUsdc, CurrencyCode.USD, false)}
            </Text>
          </View>
          <Spacer height={20} />
        </>
      )}

      <View style={styles.solidLine} />

      {details.orderType === OnChainOrderType.Send && (
        <>
          <Spacer height={20} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLeftText}>Total</Text>
            <VSpacer width={-1} />
            <Text style={styles.infoRightText}>{formatCurrency(details.totalUsdc, CurrencyCode.USD, false)}</Text>
          </View>
          <Spacer height={20} />
        </>
      )}
    </View>
  )
})

const renderTransactionTypeTitle = (itemType: OnChainOrderType) => {
  switch (itemType) {
    case OnChainOrderType.Send:
      return 'Outgoing Transfer'
    case OnChainOrderType.Receive:
      return 'Incoming Transfer'
    default:
      return 'Transfer'
  }
}

const styles = StyleSheet.create({
  solidLine: {
    ...MiscStyles.solidLine2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionBadge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    ...fonts.h4PreSemiBold,
    color: colors.textLight,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  infoLeftText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textSecondaryDark,
  },
  infoRightTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRightText: {
    alignItems: 'center',
    ...fonts.h4PreSemiBold,
    color: colors.text,
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeTxt: {
    ...fonts.h4PreSemiBold,
    color: colors.textLight,
  },
  successStatus: {
    backgroundColor: colors.accent,
  },
  pendingStatus: {
    backgroundColor: colors.warningYellow,
  },
  failStatus: {
    backgroundColor: colors.danger,
  },
  tokenIcon: {
    width: 24,
    height: 24,
  },
})
