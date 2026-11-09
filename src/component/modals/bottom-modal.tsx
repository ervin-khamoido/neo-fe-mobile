import React, { memo, PropsWithChildren, useMemo } from 'react'
import { View, StyleSheet, ViewProps } from 'react-native'
import Modal from 'react-native-modal'

import { colors, sizes } from '../../common/constrants'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ModalMutexGroup } from '../../utils/modal.mutex'
import { useModalMutex } from './common'

export type BottomModalProps = PropsWithChildren<{
  visible: boolean

  swipeable: boolean

  animationOutTiming?: number

  onSwipeDown?: () => void
  onBackdropPress?: () => void
  onModalHide?: () => void

  modalMutexGroup?: ModalMutexGroup
  barStyle?: ViewProps['style']
}>
export const BottomModal = memo<BottomModalProps>(props => {
  const {
    visible,
    swipeable,
    children,
    animationOutTiming = 200,
    onSwipeDown,
    onBackdropPress,
    onModalHide,
    modalMutexGroup,
    barStyle,
  } = props

  // --- Ad-Hoc usage of hooks ---
  const [visibleInternal, onHide] = useModalMutex(visible, modalMutexGroup, onModalHide)
  // -----------------------------

  const barStyles = useMemo(() => StyleSheet.flatten([styles.bar, barStyle]), [barStyle])

  return (
    <Modal
      style={styles.modal}
      isVisible={visibleInternal}
      animationIn={'slideInUp'}
      animationOutTiming={animationOutTiming}
      useNativeDriver={!swipeable}
      hideModalContentWhileAnimating={true}
      swipeDirection={swipeable ? 'down' : undefined}
      onBackButtonPress={onBackdropPress}
      onSwipeComplete={onSwipeDown}
      onBackdropPress={onBackdropPress}
      propagateSwipe={true}
      panResponderThreshold={20}
      onModalHide={onHide}
    >
      <SafeAreaView style={styles.container} edges={Edges}>
        {swipeable && (
          <View style={styles.barWrapper}>
            <View style={barStyles} />
          </View>
        )}
        {children}
      </SafeAreaView>
    </Modal>
  )
})

const Edges = ['bottom'] as any

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    margin: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingHorizontal: sizes.marginV2,
  },
  barWrapper: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: -4,
  },
  bar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 3,
    width: 115,
  },
})
