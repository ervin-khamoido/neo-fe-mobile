2021

import _ from 'lodash'

export interface IModalMutex {
  request(): Promise<void>
  release(): void

  readonly id: string
}

export class ModalMutex implements IModalMutex {
  private static modalMutexGroups: Record<ModalMutexGroup, IModalGroup> = Object.freeze({
    ['Root']: {
      name: 'Root',
      current: null,
      queue: [],
    },
    ['Pin']: {
      name: 'Pin',
      current: null,
      queue: [],
    },
  })

  readonly id: string

  constructor(readonly group: ModalMutexGroup = 'Root') {
    this.id = _.uniqueId()
  }

  async request(): Promise<void> {
    const mutexGroup = ModalMutex.modalMutexGroups[this.group]

    const meInQueue = mutexGroup.queue.find(x => x.id === this.id)
    if (meInQueue) {
      return
    }

    if (mutexGroup.current === null) {
      mutexGroup.current = this.id
    } else {
      return new Promise<void>((resolve, reject) => {
        mutexGroup.queue.push({ id: this.id, resolve, reject })
      })
    }
  }

  cancel(): void {
    const mutexGroup = ModalMutex.modalMutexGroups[this.group]

    if (mutexGroup.current === this.id) {
      this.release()
    } else {
      mutexGroup.queue = mutexGroup.queue.filter(x => x.id !== this.id)
    }
  }

  release(): void {
    const mutexGroup = ModalMutex.modalMutexGroups[this.group]

    if (mutexGroup.current !== this.id) {
      return
    }

    if (mutexGroup.queue.length === 0) {
      mutexGroup.current = null
      return
    }

    const next = mutexGroup.queue.shift()

    mutexGroup.current = next.id
    next.resolve()
  }
}

interface IModalPromise {
  id: string
  resolve: () => void
  reject: () => void
}

interface IModalGroup {
  name: ModalMutexGroup
  current: string | null
  queue: IModalPromise[]
}

export type ModalMutexGroup = 'Root' | 'Pin'
