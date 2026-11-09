import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../../../../common/constrants'

import { fonts } from '../../../../common/typeface'
import { Button } from '../../../../component/button-v2'

type EncourageReferralActivityCardProps = {
  shortReferralRewardInfo: string
  onReferPress: () => void
}
export const EncourageReferralActivityCard = memo<EncourageReferralActivityCardProps>(props => {
  const { shortReferralRewardInfo, onReferPress } = props

  const onReferButtonPress = useCallback(() => onReferPress(), [onReferPress])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{shortReferralRewardInfo}</Text>

      <Button style={styles.btn} textStyle={styles.btnText} title="Refer Now" onPress={onReferButtonPress} />
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.borderLight2,

    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: 5,
    marginHorizontal: 12,
    marginVertical: 16,
    ...fonts.h3SemiBold,
    color: colors.text,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 9,
  },
  btnText: {
    ...fonts.h4Regular,
  },
})
