import React, { memo } from 'react'
import Modal, { ModalProps } from 'react-native-modal'

import { useModalMutex } from './common'
import { ModalMutexGroup } from '../../utils/modal.mutex'

type NeobankModalProps = { modalMutexGroup?: ModalMutexGroup } & Partial<ModalProps>
export const BasicModal = memo<NeobankModalProps>(props => {
  const { isVisible, children, onModalHide, modalMutexGroup, ...rest } = props

  // --- Ad-Hoc usage of hooks ---
  const [visibleInternal, onHide] = useModalMutex(isVisible, modalMutexGroup, onModalHide)
  // -----------------------------

  return (
    <Modal {...rest} isVisible={visibleInternal} onModalHide={onHide}>
      {children}
    </Modal>
  )
})
