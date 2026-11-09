import { inject, injectable } from 'inversify'
import { ILevelStore, LevelStoreSymbol } from '../store/level.store'
import { ILevelOneService, LevelOneServiceSymbol } from './level-one.service'
import { ILevelTwoService, LevelTwoServiceSymbol } from './level-two.service'
import { UserLevel } from '../../models/level/definitions'
import { IToastService, ToastServiceSymbol } from '../toast.service'

export interface ILevelFlowService {
  triggerNextLevelFlow(): Promise<void>
  triggerNextLevelFlowSync(): Promise<void>
}

export const LevelFlowServiceSymbol = Symbol.for('ILevelFlowService')

@injectable()
export class LevelFlowService implements ILevelFlowService {
  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService
  @inject(LevelTwoServiceSymbol) levelTwoService!: ILevelTwoService
  @inject(ToastServiceSymbol) toastService!: IToastService

  async triggerNextLevelFlow(): Promise<void> {
    const { currentLevel } = this.levelStore

    const nextLevel = currentLevel?.next
    if (!nextLevel) {
      return
    }

    switch (nextLevel.code) {
      case UserLevel.Level1:
        return this.levelOneService.triggerFlowWithoutAck()
      case UserLevel.Level2:
        return this.levelTwoService.triggerFlow()
      default:
        return
    }
  }

  async triggerNextLevelFlowSync(): Promise<void> {
    const { next } = this.levelStore.currentLevel

    switch (next?.code) {
      case UserLevel.Level0:
      case UserLevel.Level1:
        await this.levelOneService.triggerFlowWithoutAck()
        await this.levelOneService.waitCurrentFlow()

        break
      case UserLevel.Level2:
        await this.levelTwoService.triggerFlow()
        await this.levelTwoService.waitCurrentFlow()

        break
      default:
        throw new Error('Not implemented')
    }
  }
}
