import { inject, injectable, named } from 'inversify'
import read, { readable } from '@ts-awesome/model-reader'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { ILevelStore, LevelStoreSymbol } from '../store/level.store'
import { UserLevelDetails } from '../../models/level/user-level-details'
import { CurrentUserLevelInfo } from '../../models/level/current-user-level-info'
import { ApiServiceSymbol, IApiService } from '../api.service'

import { StatusCode } from '../../common/constrants'
import { floorAmount, TWO_DECIMAL_CONFIG } from '../../utils/amount'
import { IUserService, UserServiceSymbol } from '../user.service'
import { ActionLimits, MaxAvailableActionLimit, TransactionLimits, UserActionType } from '../../models'
import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { MainNavigatorDef } from '../../screen/common'
import { reaction } from 'mobx'

export interface ILevelService {
  initialize(): void

  syncCurrentLevel(): Promise<void>
  syncCurrentLimits(): Promise<void>
  syncTransactionLimits(): Promise<void>
  syncLevelsDetails(): Promise<void>

  // navigation actions
  navigateToAccountLevel(): Promise<void>
}

export const LevelServiceSymbol = Symbol.for('ILevelService')

@injectable()
export class LevelService implements ILevelService {
  @inject(AppMonitoringServiceSymbol) @named('LevelService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>

  @inject(UserServiceSymbol) userService!: IUserService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore

  private _subscription: (() => void) | null

  initialize(): void {
    reaction(
      () => this.userStore.me?.uid,
      user => {
        if (user) {
          this.subscribe()
        } else {
          this.unsubscribe()
        }
      },
    )
  }

  subscribe(): void {
    const { me: user } = this.userStore
    this.monitoring.assert(user, 'Expected a this.userStore.me to be not null')

    if (!user) {
      return
    }

    this._subscription = firestore()
      .collection<UserInfo>('user')
      .doc(user.fireUserId)
      .onSnapshot(this.onSnapshot, this.onError)
  }

  unsubscribe(): void {
    this._subscription?.()
  }

  async navigateToAccountLevel(): Promise<void> {
    const { currentLevel, levelsDetails } = this.levelStore

    const loadingPromises = []
    if (!currentLevel) {
      loadingPromises.push(this.syncCurrentLevel())
    }

    if (levelsDetails.length < 1) {
      loadingPromises.push(this.syncLevelsDetails())
    }

    await Promise.all(loadingPromises)

    this.navigation.navigate('AccountLevel')
  }

  private onSnapshot = async (snapshot: FirebaseFirestoreTypes.DocumentSnapshot<UserInfo>) => {
    const { level } = read(snapshot.data(), UserInfo) ?? {}

    const { version: currentVersion } = this.levelStore
    if (currentVersion && level && level.version <= currentVersion) {
      return
    }

    this.levelStore.setVersion(level?.version ?? null)
    await Promise.all([
      this.syncCurrentLevel(),
      this.syncLevelsDetails(),
      this.syncCurrentLimits(),
      this.userService.syncMe(),
      //
    ])
  }

  private onError = (err: Error) => {
    this.monitoring.exception(err)
  }

  async syncLevelsDetails(): Promise<void> {
    try {
      const result = await this.api.withAuth(h =>
        h.get<UserLevelDetails[]>('/api/v1/user/level/info', { Model: [UserLevelDetails] }),
      )

      this.levelStore.setLevelsDetails(result)
    } catch (err) {
      this.defaultErrorHandler(err)
    }
  }

  async syncCurrentLevel(): Promise<void> {
    try {
      const currentLevel = await this.api.withAuth(h => h.get('/api/v1/user/level', { Model: CurrentUserLevelInfo }))

      this.levelStore.setCurrentLevel(currentLevel)
    } catch (err) {
      this.defaultErrorHandler(err)
    }
  }

  async syncCurrentLimits(): Promise<void> {
    try {
      let maxAvailableActionLimits = await this.api.withAuth(http =>
        http.get<MaxAvailableActionLimit[]>('/api/v2/user/limits', { Model: [MaxAvailableActionLimit] }),
      )

      // https://neobank.atlassian.net/browse/NEOBANK-698
      maxAvailableActionLimits = maxAvailableActionLimits.map(e => {
        return { ...e, maxLimit: floorAmount(e.maxLimit, TWO_DECIMAL_CONFIG) }
      })

      const limits: ActionLimits = {
        PO: maxAvailableActionLimits.find(al => al.actionType === UserActionType.PO),
        SO: maxAvailableActionLimits.find(al => al.actionType === UserActionType.SO),
        Send: maxAvailableActionLimits.find(al => al.actionType === UserActionType.Send),
      }

      this.levelStore.setCurrentLimits(limits)
    } catch (err) {
      this.defaultErrorHandler(err)
    }
  }

  async syncTransactionLimits(): Promise<void> {
    try {
      const transactionLimits = await this.api.withAuth(http =>
        http.get('/api/v1/order/transaction/limits', { Model: TransactionLimits }),
      )

      this.levelStore.setTransactionLimits(transactionLimits)
    } catch (err) {
      this.defaultErrorHandler(err)
    }
  }

  private defaultErrorHandler(err: any): void | never {
    if (err instanceof RequestError && err.statusCode === StatusCode.ServerError) {
      this.monitoring.exception(err)
      throw new ConnectionError('')
    } else if (err instanceof ConnectionError) {
      throw err
    } else {
      this.monitoring.exception(err)
    }
  }
}

class LevelInfo {
  @readable(Number) version!: number
}

class UserInfo {
  @readable(LevelInfo, true) level?: LevelInfo | null
}
