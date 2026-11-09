import { inject, injectable } from 'inversify'
import { action, computed, makeObservable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { ILevelOneService, LevelOneServiceSymbol } from '../../../services/level/level-one.service'

@injectable()
export class LevelOneAcknowledgmentBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>

  @inject(LevelOneServiceSymbol) levelOneService!: ILevelOneService

  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  @computed get showModal() {
    return this.levelStore.showLevelOneAck
  }

  @computed get isSkippable() {
    return this.levelStore.isLevelOneAckSkippable
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  onSecondaryAction() {
    this.levelOneService.interruptFlow()
    this.levelStore.hideLevelOneAckModal()
  }

  @action onConfirm() {
    this.levelOneService.nextFlowStep(true)
    this.levelStore.hideLevelOneAckModal()
  }
}
