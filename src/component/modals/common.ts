import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ModalMutex, ModalMutexGroup } from '../../utils/modal.mutex'
import { InteractionManager } from 'react-native'

export function useModalMutex(
  visible: boolean,
  modalGroup?: ModalMutexGroup,
  onModalHide?: () => void,
): [boolean, () => void] {
  const [visibleInternal, setVisibleInternal] = useState(false)
  const modalMutex = useRef(new ModalMutex(modalGroup))
  useLayoutEffect(() => {
    if (visible) {
      modalMutex.current
        .request()
        .then(() => {
          setVisibleInternal(true)
        })
        .catch(() => {
          // request denied
          onModalHide?.()
        })
    } else {
      setVisibleInternal(false)
    }
  }, [visible, modalMutex, onModalHide])
  const onHide = useCallback(() => {
    modalMutex.current?.release()
    onModalHide?.()
  }, [onModalHide, modalMutex])
  useEffect(() => {
    const currentMutex = modalMutex.current

    return () => currentMutex?.release()
  }, [modalMutex])

  return [visibleInternal, onHide]
}
