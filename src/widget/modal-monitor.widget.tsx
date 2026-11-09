import React, { memo } from 'react'

import ioc from '../ioc'

import { ModalMonitorBLoC } from './modal-monitor.bloc'

export type ModalMonitorProps = {
  isVisible: boolean
  hostComponentName: string
  modalName: string
}
export const ModalMonitor = memo((props: ModalMonitorProps) => {
  ioc.useBLoC(ModalMonitorBLoC, props)

  return null
})
