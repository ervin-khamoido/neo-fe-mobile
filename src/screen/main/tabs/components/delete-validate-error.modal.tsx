import React, { memo } from 'react'
import { Text, StyleSheet, View } from 'react-native'

import { BottomModal, BottomModalProps } from '../../../../component/modals/bottom-modal'
import { fonts } from '../../../../common/typeface'
import { colors } from '../../../../common/constrants'
import { Spacer, VSpacer } from '../../../../component/spacer'
import { Button, OutlineButton } from '../../../../component/button'
import VectorImage from 'react-native-vector-image'

type DeleteValidateErrorProps = {
  loading: boolean
  errorCTAs: string[]
  errorBtn?: {
    title: string
    onPress: () => void
  }

  onBack: () => void
  onConfirm: () => void
} & BottomModalProps
export const DeleteValidateErrorModal = memo<DeleteValidateErrorProps>(props => {
  const { loading, onBack, onConfirm, errorCTAs, errorBtn, ...rest } = props

  return (
    <BottomModal
      {...rest}
      onSwipeDown={loading ? undefined : rest.onSwipeDown}
      onBackdropPress={loading ? undefined : rest.onBackdropPress}
    >
      <VectorImage style={styles.icon} width={32} height={32} source={AlertIconSrc} />
      <Spacer height={15} />

      <Text style={styles.header}>You have remaining actions to do</Text>
      <Spacer height={5} />

      {errorCTAs.map((text, index) => (
        <View key={index} style={styles.listEntry}>
          <Text style={styles.listNumber}>{index + 1}.</Text>
          <Text style={styles.listText}>{text}</Text>
        </View>
      ))}

      <Spacer height={35} />

      <View style={styles.buttons}>
        {!!errorBtn && (
          <>
            <OutlineButton
              style={styles.button}
              title={errorBtn.title}
              loading={loading}
              disabled={loading}
              onPress={errorBtn.onPress}
            />
            <VSpacer width={17} />
          </>
        )}
        <Button style={styles.button} title="Cancel" disabled={loading} onPress={onBack} />
      </View>

      <Spacer height={36} />
    </BottomModal>
  )
})

const AlertIconSrc = require('../../../../../assets/images/exclamation-point-circle-small-red.icon.svg')
const styles = StyleSheet.create({
  header: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
  },

  icon: {
    alignSelf: 'center',
    width: 32,
    height: 32,
  },
  body: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },

  listEntry: {
    flexDirection: 'row',
    paddingHorizontal: 3,
  },
  listNumber: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'left',
    width: 24,
  },
  listText: {
    flex: 1,
    ...fonts.h3Regular,
    color: colors.text,
  },
})
