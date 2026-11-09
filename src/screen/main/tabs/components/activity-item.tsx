import React, { ReactNode, useCallback, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { ActivityIndicator, ImageRequireSource, ImageStyle, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import VectorImage from 'react-native-vector-image'

import { colors, CurrencyCode } from '../../../../common/constrants'
import { colors as colorsV2 } from '../../../../common/colorV2'
import {
  Activity,
  ActivityStatusEnum,
  ActivityType,
  CardOrderActivityStatus,
  CardOrderType,
  IYieldOrderDetails,
  LockOrderActivityStatus,
  LockOrderType,
  OnChainOrderActivityStatus,
  OnChainOrderType,
  PurchaseOrderActivityStatus,
  SellOrderActivityStatus,
  TransferOrderActivityStatus,
} from '../../../../models'
import { fonts } from '../../../../common/typeface'
import { formatActivityDate, formatCurrency } from '../../../../lib/utils/helpers'
import { VSpacer } from '../../../../component/spacer'
import { OnChainTokenIcon } from '../../activity/common'

const UnsuccessfulIconSrc = require('../../../../../assets/images/exclamation-point-circle-small-red.icon.svg')
const ArrowDown = require('../../../../../assets/images/arrow-down.icon.svg')
const PlusIconSrc = require('../../../../../assets/images/plus.icon.svg')
const MinusIconSrc = require('../../../../../assets/images/minus.icon.svg')
const DollarSignIconSrc = require('../../../../../assets/images/dollar-sign.icon.svg')

type ActivityItemProps = {
  loading?: boolean
  item: Activity
  onPress: (uid: string) => void
}

export const ActivityItem = observer<ActivityItemProps>(props => {
  const { loading, item, onPress } = props
  const onItemPress = useCallback(() => onPress(item.uid), [item, onPress])

  const minusSignTypes = [ActivityType.Sell, ActivityType.Transfer_Send, ActivityType.OnChain]
  const plusSignTypes = [ActivityType.Transfer_Receive, ActivityType.Reward, ActivityType.Yield, ActivityType.Buy]

  let sign: string | null = null

  if (item.details.type === ActivityType.Card) {
    const minusSingCardTypes = [CardOrderType.Unload, CardOrderType.Spend, CardOrderType.Fee, CardOrderType.SpendFee]
    const plusSingCardTypes = [CardOrderType.Fund, CardOrderType.Reversal]

    const isMinus = minusSingCardTypes.includes(item.details.orderType)
    const isPlus = plusSingCardTypes.includes(item.details.orderType)

    sign = isMinus ? '-' : isPlus ? '+' : null
  } else if (item.details.type === ActivityType.OnChain) {
    const minusSingOnChainTypes = [OnChainOrderType.Send]
    const plusSingOnChainTypes = [OnChainOrderType.Receive]

    const isMinus = minusSingOnChainTypes.includes(item.details.orderType)
    const isPlus = plusSingOnChainTypes.includes(item.details.orderType)

    sign = isMinus ? '-' : isPlus ? '+' : null
  } else if (item.details.type === ActivityType.Lock) {
    const minusSingTypes = [LockOrderType.Withdraw]
    const plusSingTypes = [LockOrderType.Deposit]

    const isMinus = minusSingTypes.includes(item.details.orderType)
    const isPlus = plusSingTypes.includes(item.details.orderType)

    sign = isMinus ? '-' : isPlus ? '+' : null
  } else if (minusSignTypes.includes(item.type)) {
    sign = '-'
  } else if (plusSignTypes.includes(item.type)) {
    sign = '+'
  }

  const amountColor = sign === '-' ? colorsV2.danger : colorsV2.accent
  const amountStyles = useMemo(() => [styles.regular, { color: amountColor }], [amountColor])

  const iconStyles = useMemo(() => [getActivityIconStyle(item), getActivityIconSize(item.type)], [item])

  return (
    <TouchableOpacity key={item.orderReferenceNumber} style={styles.activityCard} onPress={onItemPress}>
      <View style={styles.cardRow}>
        {UnsuccessfulStatuses[item.type]?.includes(item.status) ? (
          <View style={styles.sendIcon}>
            <VectorImage style={styles.unsuccessfulIcon} width={32} height={32} source={UnsuccessfulIconSrc} />
          </View>
        ) : (
          <View style={{ ...styles.sendIcon, ...styles.successfulIcon }}>
            <VectorImage style={iconStyles} source={getActivityIcon(item)} {...getActivityIconSize(item.type)} />
          </View>
        )}

        <VSpacer width={12} />

        <View style={styles.descriptionRow}>
          <Text style={styles.bold} numberOfLines={1}>
            {getActivityTitle(item)}
          </Text>

          <Text style={styles.timeAgo}>{formatActivityDate(item.createdAt)}</Text>
        </View>

        <View style={styles.amountRow}>
          {!!loading && <ActivityIndicator color={colors.primary} />}

          <Text style={amountStyles}>
            {sign}
            {formatCurrency(item.amountUsdc, CurrencyCode.USD, false)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})
// backward compatibility to version 1.4
// in order to switch using only "yieldMonth" we need to
// update old Activities in Firestore where yieldMonth is undefined
const getYieldMonth = (details: IYieldOrderDetails) => {
  if (details.yieldMonth === 0 || !!details.yieldMonth) {
    return months[details.yieldMonth]
  }

  return months[details.month - 1]
}

const UnsuccessfulStatuses: Record<ActivityType, ActivityStatusEnum[]> = {
  [ActivityType.Buy]: [
    PurchaseOrderActivityStatus.Cancelled,
    PurchaseOrderActivityStatus.PaymentNotReceived,
    PurchaseOrderActivityStatus.Refunded,
  ],
  [ActivityType.Sell]: [SellOrderActivityStatus.Cancelled],
  [ActivityType.Yield]: [],
  [ActivityType.Reward]: [],
  [ActivityType.Transfer_Receive]: [TransferOrderActivityStatus.Failed],
  [ActivityType.Transfer_Send]: [TransferOrderActivityStatus.Failed],
  [ActivityType.Card]: [CardOrderActivityStatus.Failed],
  [ActivityType.OnChain]: [OnChainOrderActivityStatus.Failed, OnChainOrderActivityStatus.Quarantine],
  [ActivityType.Lock]: [LockOrderActivityStatus.Failed],
}

export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const getActivityTitle = (item: Activity): ReactNode => {
  const ACTIVITY_TITLE_BY_TYPE = {
    [ActivityType.Buy]: 'Deposit',
    [ActivityType.Sell]: 'Withdraw',
    [ActivityType.Transfer_Receive]: 'Receive',
    [ActivityType.Transfer_Send]: 'Send',
    [ActivityType.OnChain]: 'On-Chain',
    [ActivityType.Lock]: 'Dream Lock',
  }

  const CardActivityTitle = {
    [CardOrderType.Fund]: 'Card Top-up',
    [CardOrderType.Unload]: 'Card Withdrawal',
    [CardOrderType.Reversal]: 'Purchase Reversal',
    [CardOrderType.Fee]: 'Card Creation',
    [CardOrderType.SpendFee]: 'Card Transaction Fee',
  }

  const OnChainActivityTitle = {
    [OnChainOrderType.Receive]: 'Receive',
    [OnChainOrderType.Send]: 'Send',
  }

  const LockActivityTitle = {
    [LockOrderType.Deposit]: 'Dream Lock Deposit',
    [LockOrderType.Withdraw]: 'Dream Lock Withdraw',
  }

  switch (item.details?.type) {
    case ActivityType.Yield:
      return item.details.type === ActivityType.Yield ? `${getYieldMonth(item.details)} Earnings` : ''
    case ActivityType.Reward:
      return item.details.type === ActivityType.Reward ? item.details?.title ?? 'Bonus' : ''
    case ActivityType.Card: {
      const failedLabel = item.status === CardOrderActivityStatus.Failed ? ' Failed' : ''

      switch (item.details.orderType) {
        case CardOrderType.Spend:
          return (item.details.providerDescription ?? 'Online Purchase') + failedLabel
        default:
          return (CardActivityTitle[item.details.orderType] ?? 'Card Transaction') + failedLabel
      }
    }
    case ActivityType.OnChain: {
      const { details } = item

      return (
        <>
          {`${OnChainActivityTitle[details.orderType]} `}
          <VectorImage style={styles.coinIcon} width={16} height={16} source={OnChainTokenIcon[details.coin]} />
        </>
      )
    }
    case ActivityType.Lock: {
      return LockActivityTitle[item.details.orderType] ?? 'Transaction'
    }
    default:
      return ACTIVITY_TITLE_BY_TYPE[item.type] || ''
  }
}

const getActivityIcon = (item: Activity): ImageRequireSource => {
  const SuccessfulIcons = {
    [ActivityType.Buy]: ArrowDown,
    [ActivityType.Sell]: ArrowDown,
    [ActivityType.Yield]: PlusIconSrc,
    [ActivityType.Reward]: PlusIconSrc,
    [ActivityType.Transfer_Receive]: ArrowDown,
    [ActivityType.Transfer_Send]: ArrowDown,
  }

  const CardSuccessfulIcons = {
    [CardOrderType.Fund]: PlusIconSrc,
    [CardOrderType.Unload]: MinusIconSrc,
    [CardOrderType.Spend]: DollarSignIconSrc,
    [CardOrderType.Reversal]: DollarSignIconSrc,
    [CardOrderType.Fee]: MinusIconSrc,
    [CardOrderType.SpendFee]: MinusIconSrc,
  }

  const OnChainIcons = {
    [OnChainOrderType.Send]: MinusIconSrc,
    [OnChainOrderType.Receive]: PlusIconSrc,
  }

  const LockIcons = {
    [LockOrderType.Withdraw]: MinusIconSrc,
    [LockOrderType.Deposit]: PlusIconSrc,
  }

  switch (item.details?.type) {
    case ActivityType.Card:
      return CardSuccessfulIcons[item.details.orderType] ?? DollarSignIconSrc
    case ActivityType.OnChain:
      return OnChainIcons[item.details.orderType]
    case ActivityType.Lock:
      return LockIcons[item.details.orderType] ?? DollarSignIconSrc
    default:
      return SuccessfulIcons[item.details?.type] ?? DollarSignIconSrc
  }
}

const getActivityIconStyle = (item: Activity): ImageStyle => {
  const iconStyles = {
    [ActivityType.Buy]: styles.buyIconStyles,
    [ActivityType.Sell]: styles.sellIconStyles,
    [ActivityType.Yield]: styles.plusIcon,
    [ActivityType.Reward]: styles.plusIcon,
    [ActivityType.Transfer_Receive]: styles.successfulReceiveIcon,
    [ActivityType.Transfer_Send]: styles.successfulSendIcon,
    [ActivityType.Card]: styles.plusIcon,
    [ActivityType.OnChain]: styles.plusIcon,
    [ActivityType.Lock]: styles.plusIcon,
  }

  return iconStyles[item.type]
}

const getActivityIconSize = (itemType: ActivityType): { width: number; height: number } => {
  switch (itemType) {
    case ActivityType.Yield:
    case ActivityType.Reward:
      return { width: 24, height: 24 }
    default:
      return { width: 16, height: 16 }
  }
}

const styles = StyleSheet.create({
  activityCard: {
    borderColor: colors.border2,
  },
  cardRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  descriptionRow: {
    flex: 1,
    justifyContent: 'flex-start',
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
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bold: {
    ...fonts.h4PreSemiBold,
    color: colors.text,
    paddingRight: 5,
  },
  regular: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  timeAgo: {
    ...fonts.h5Regular,
    color: colors.gray5,
  },
  unsuccessfulIcon: {
    tintColor: colors.warningYellow,
    width: 32,
    height: 32,
  },
  sendIcon: {
    width: 32,
    height: 32,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 100,
  },
  successfulIcon: {
    backgroundColor: colors.gray5,
  },
  successfulSendIcon: {
    transform: [{ rotateZ: '180deg' }],
  },
  successfulReceiveIcon: {},
  buyIconStyles: {
    transform: [{ rotateZ: '-45deg' }],
  },
  sellIconStyles: {
    transform: [{ rotateZ: '-135deg' }],
  },
  plusIcon: {
    tintColor: colors.background,
  },
  coinIcon: {
    width: 16,
    height: 16,
  },
})
