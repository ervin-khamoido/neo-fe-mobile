import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'
import { Spacer } from '../spacer'
import { LinkButton } from '../button'
import { useModalMutex } from './common'
import { ModalMutexGroup } from '../../utils/modal.mutex'

type ModalButton = {
  title: string
  onPress: () => void
}

type SimpleModalProps = {
  visible: boolean

  header: string
  body: string

  // TODO: implement when multiple buttons will be required
  // buttons: ModalButton[]

  button: ModalButton

  modalMutexGroup?: ModalMutexGroup
}
export const SimpleModal = memo<SimpleModalProps>(props => {
  const { visible, header, body, button, modalMutexGroup } = props

  // --- Ad-Hoc usage of hooks ---
  const [visibleInternal, onHide] = useModalMutex(visible, modalMutexGroup)
  // -----------------------------

  return (
    <Modal
      isVisible={visibleInternal}
      animationIn={'slideInUp'}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      onBackButtonPress={button.onPress}
      onBackdropPress={button.onPress}
      swipeDirection={'down'}
      onSwipeComplete={button.onPress}
      onModalHide={onHide}
    >
      <View style={styles.container}>
        <Text style={styles.header}>{header}</Text>
        <Spacer height={4} />

        <Text style={styles.body}>{body}</Text>
        <Spacer height={16} />

        <View style={styles.hr} />
        <Spacer height={16} />

        <LinkButton
          type="primary"
          title={button.title}
          style={styles.okBtn}
          textStyle={styles.okBtnTxt}
          onPress={button.onPress}
        />
      </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },
  hr: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border2,
  },
  okBtn: {
    paddingVertical: 2,
  },
  okBtnTxt: {
    ...fonts.h3SemiBold,
  },
})
