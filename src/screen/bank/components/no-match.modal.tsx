import React, { memo } from 'react'
import { Text, StyleSheet, View } from 'react-native'

import { BottomModal, BottomModalProps } from '../../../component/modals/bottom-modal'
import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'
import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton } from '../../../component/button'
import VectorImage from 'react-native-vector-image'

const AttentionIcon = require('../../../../assets/images/attention.svg')

export const NO_MATCH_ANIMATION_OUT = 200

type NoMatchModalProps = {
  fullName: string

  onCancel: () => void
  onEdit: () => void
} & BottomModalProps
export const NoMatchModal = memo<NoMatchModalProps>(props => {
  const { fullName, onCancel, onEdit, ...rest } = props

  return (
    <BottomModal {...rest} animationOutTiming={NO_MATCH_ANIMATION_OUT}>
      <VectorImage style={styles.icon} width={44} height={44} source={AttentionIcon} />
      <Spacer height={12} />

      <Text style={styles.header}>Account name doesn't match our records</Text>
      <Spacer height={12} />

      <Text style={styles.belongsToTxt}>
        Account details entered do not match your Neobank wallet name - <Text style={styles.fullNameTxt}>{fullName}</Text>
        {'\n\n'}Please contact Customer Support if there is a mistake with your registered full name.
      </Text>
      <Spacer height={56} />

      <View style={styles.buttons}>
        <OutlineButton style={styles.button} title="Cancel" onPress={onCancel} />
        <VSpacer width={17} />
        <Button style={styles.button} title="Edit Details" onPress={onEdit} />
      </View>

      <Spacer height={36} />
    </BottomModal>
  )
})

const styles = StyleSheet.create({
  header: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  belongsToTxt: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },
  fullNameTxt: {
    ...fonts.h3Bold,
    color: colors.primary,
  },

  icon: {
    alignSelf: 'center',
    width: 44,
    height: 44,
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
})
