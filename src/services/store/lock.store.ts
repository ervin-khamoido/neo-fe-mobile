import { cleanable, ICleanable } from '../../utils/sanitizer'
import { injectable } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'
import { Lock, LockStatus } from '../../models/lock'

export interface ILockStore {
  readonly allLocks: Lock[]
  readonly locks: Lock[]
  readonly expiredLocks: Lock[]

  setLocks(locks: Lock[]): void

  readonly locksVersion: number
  setLocksVersion(value: number): void
}

export const LockStoreSymbol = Symbol.for('ILockStore')

@cleanable
@injectable()
export class LockStore implements ILockStore, ICleanable {
  @observable allLocks: Lock[] = []
  @observable locksVersion: number = -1

  @computed get locks() {
    return this.allLocks.filter(x => x.status === LockStatus.ACTIVE)
  }

  @computed get expiredLocks() {
    return this.allLocks.filter(x => x.status === LockStatus.EXPIRED)
  }

  constructor() {
    makeObservable(this)
  }

  @action setLocks(locks: Lock[]): void {
    this.allLocks = locks
  }

  @action setLocksVersion(value: number): void {
    this.locksVersion = value
  }

  @action clean() {
    this.allLocks = []
    this.locksVersion = -1
  }
}
