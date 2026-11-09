import { inject, injectable, named } from 'inversify'
import { action, computed, makeObservable, observable, observe } from 'mobx'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { HelpCenterArticle, HelpCenterCategory, HelpCenterFolder } from '../../models'
import { PersistanceSymbol } from '../../lib/utils/persistance'
import { cleanable, ICleanable } from '../../utils/sanitizer'

export interface ISupportStore {
  readonly helpCenter: HelpCenterCategory[]
  readonly helpCenterFolders: HelpCenterFolder[]
  readonly helpCenterArticles: HelpCenterArticle[]
  readonly isHelpCenterReady: boolean

  setHelpCenter(value: HelpCenterCategory[]): void
  getArticle(id: string): HelpCenterArticle | null

  readonly freshchatRestoreId: string | null
  setFreshchatRestoreId(value: string): void
  resetFreshchatRestoreId(): void

  readonly freshchatUnreadCount: number
  setFreshchatUnreadCount(value: number): void
}

export const SupportStoreSymbol = Symbol.for('ISupportStore')

@cleanable
@injectable()
export class SupportStore implements ISupportStore, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('SupportStore') monitoring!: IMonitoringService

  @inject(PersistanceSymbol) persistance!: {
    helpCenter?: HelpCenterCategory[]
  }

  @observable helpCenter: HelpCenterCategory[] = []

  @computed get helpCenterFolders() {
    return this.helpCenter.reduce<HelpCenterFolder[]>((res, curr) => {
      res.push(...curr.folders)
      return res
    }, [])
  }

  @computed get helpCenterArticles() {
    return this.helpCenter.reduce<HelpCenterArticle[]>((res, curr) => {
      for (const folder of curr.folders) {
        res.push(...folder.articles)
      }

      return res
    }, [])
  }

  @computed get isHelpCenterReady() {
    return this.helpCenter.length !== 0
  }

  @observable freshchatUnreadCount = 0

  constructor() {
    makeObservable(this)

    setImmediate(() => this.initialize())
  }

  @action initialize() {
    this.helpCenter = this.persistance.helpCenter ?? []

    observe(this, () => {
      this.persistance.helpCenter = this.helpCenter
    })
  }

  @action setHelpCenter(value: HelpCenterCategory[]): void {
    this.helpCenter = value
  }

  getArticle(id: string): HelpCenterArticle | null {
    for (const category of this.helpCenter) {
      for (const folder of category.folders) {
        for (const article of folder.articles) {
          if (article.id === id) {
            return article
          }
        }
      }
    }
  }

  @observable freshchatRestoreId: string | null

  @action setFreshchatRestoreId(value: string): void {
    this.freshchatRestoreId = value
  }

  @action resetFreshchatRestoreId(): void {
    this.freshchatRestoreId = null
  }

  @action setFreshchatUnreadCount(value: number): void {
    this.freshchatUnreadCount = value
  }

  @observable clean(): void {
    this.resetFreshchatRestoreId()
    this.freshchatUnreadCount = 0
  }
}
