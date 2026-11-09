import React, { useCallback, useMemo } from 'react'
import VectorImage from 'react-native-vector-image'
import { observer } from 'mobx-react-lite'

import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typeface'
import { VSpacer } from '../../../../component/spacer'
import { Lock, LockStatus } from '../../../../models'
import { formatCurrency, formatDateInWAT } from '../../../../lib/utils/helpers'
import { CurrencyCode, DEFAULT_DATE_TIME_FORMAT } from '../../../../common/constrants'
import { formatExpirationDuration } from '../../../../utils/helpers'

type LockButtonProps = {
  index: number
  loading?: boolean
  item: Lock
  onLockItem: (uid: string) => void
} & Omit<TouchableOpacityProps, 'onPress'>

export const LockButton = observer<LockButtonProps>(props => {
  const { style, item, onLockItem, index, ...otherProps } = props

  const onPress = useCallback(() => onLockItem(item.uid), [item, onLockItem])

  const isExpired = useMemo(() => item.status === LockStatus.EXPIRED, [item])
  const iconSize = useMemo(() => (isExpired ? EXPIRED_LOCK_ICON_SIZE : ACTIVE_LOCK_ICON_SIZE), [isExpired])

  const containerStyle = useMemo(
    () => StyleSheet.flatten([isExpired ? styles.expiredLockContainer : styles.container, style]),
    [isExpired, style],
  )
  const iconWrapperStyles = useMemo(() => StyleSheet.flatten([isExpired ? styles.lockIconWrapper : {}]), [isExpired])
  const iconStyles = useMemo(
    () =>
      StyleSheet.flatten([isExpired ? styles.expiredLockIcon : styles.lockIcon, { width: iconSize, height: iconSize }]),
    [isExpired, iconSize],
  )

  const formattedExpiredAt = useMemo(
    () => (item.expiredAt ? formatDateInWAT(item.expiredAt, DEFAULT_DATE_TIME_FORMAT) : ''),
    [item],
  )
  const formattedDuration = useMemo(() => formatExpirationDuration(item.expiresAt), [item])

  return (
    <TouchableOpacity {...otherProps} onPress={onPress} style={containerStyle}>
      <View style={styles.row}>
        <View style={iconWrapperStyles}>
          <VectorImage style={iconStyles} width={iconSize} height={iconSize} source={LockIconSrc} />
        </View>
        <VSpacer width={12} />

        <View>
          <Text numberOfLines={1} style={styles.title}>
            {item?.name ?? 'Dream Lock'}
          </Text>

          {item.expiredAt ? (
            <Text style={styles.smallText}>Expired at {formattedExpiredAt}</Text>
          ) : (
            <Text style={styles.smallText}>Expires in {formattedDuration}</Text>
          )}
        </View>
      </View>

      <Text style={styles.regularText}>{formatCurrency(item.balance, CurrencyCode.USD, false)}</Text>
      {/*<Text style={styles.smallRightText}>2 Tickets</Text>*/}
    </TouchableOpacity>
  )
})

const LockIconSrc = require('../../../../../assets/images/lock-v2.icon.svg')

const EXPIRED_LOCK_ICON_SIZE = 16
const ACTIVE_LOCK_ICON_SIZE = 24

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.disabledBackground,
    borderRadius: 20,
  },
  expiredLockContainer: {
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...fonts.h4Regular,
    color: colors.text,
  },
  regularText: {
    ...fonts.h4Regular,
    justifyContent: 'space-between',
    color: colors.text,
    lineHeight: 28,
    fontWeight: '600',
  },
  smallText: {
    ...fonts.h6Regular,
    color: colors.textLabel,
  },
  smallRightText: {
    textAlign: 'right',
    ...fonts.h6Regular,
    color: colors.textLabel,
  },
  lockIcon: {
    tintColor: colors.primary,
  },
  expiredLockIcon: {
    tintColor: colors.background,
  },
  lockIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.disabledBackground5,
    borderRadius: 100,
  },
})
