import { inject, injectable } from 'inversify'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import reader from '@ts-awesome/model-reader'
import { reaction } from 'mobx'

import { Activity, ActivityType } from '../../models'

import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { ActivityStoreSymbol, IActivityStore } from '../store/activity.store'
import { ApiServiceSymbol, IApiService } from '../api.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { ActivityUtilsServiceSymbol, IActivityUtilsService } from './activity-utils.service'

export interface IActivityService {
  initialize(): void

  markAsRead(activityUid: string): void
  markAllAsRead(activityUids: string[]): void

  syncActivityForOrder(order: string): Promise<string>
  syncLatestUnseenReward(): Promise<string>
}

export const ActivityServiceSymbol = Symbol.for('IActivityService')

@injectable()
export class ActivityService implements IActivityService {
  private _subscriptions: (() => void)[] = []

  @inject(ApiServiceSymbol) api!: IApiService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(ActivityUtilsServiceSymbol) activityUtilsService!: IActivityUtilsService

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
    const collections = this.collections()
    if (collections.length === 0) {
      return
    }

    for (const collection of collections) {
      const subscription = collection.onSnapshot(
        x => this.handleSnapshot(x),
        e => this.handleSnapshotError(e),
      )

      this._subscriptions.push(subscription)
    }
  }

  unsubscribe(): void {
    for (const subscription of this._subscriptions) {
      subscription()
    }
  }

  markAsRead(activityUid: string): void {
    setImmediate(async () => {
      try {
        const activity = this.activityStore.getOne(activityUid)
        if (!activity || !activity.isNew) {
          return
        }

        const seenAt = new Date().toISOString()
        const collection = this.collectionForType(activity.type)

        await collection.doc(activityUid).update('seenAt', seenAt)
      } catch (err) {
        const message = (err.stack ? err.stack : err.message) ?? `Error updating seenAt for activity:${activityUid}`
        this.monitoring.exception(message)
      }
    })
  }

  markAllAsRead(activityUids: string[]): void {
    setImmediate(async () => {
      try {
        const activities = this.activityStore.getMany(activityUids).filter(x => x.isNew)
        const seenAt = new Date().toISOString()

        const batch = firestore().batch()
        for (const activity of activities) {
          const document = this.collectionForType(activity.type).doc(activity.uid)
          batch.update(document, 'seenAt', seenAt as any)
        }

        await batch.commit()
      } catch (err) {
        this.monitoring.exception(err)
      }
    })
  }

  async syncActivityForOrder(order: string): Promise<string> {
    const item = await this.api.withAuth(http => http.get(`/api/v1/order/${order}/activity`, { Model: Activity }))
    this.activityUtilsService.floorActivityAmount(item)

    this.activityStore.push(item)

    return item.uid
  }

  async syncLatestUnseenReward(): Promise<string> {
    try {
      const lastReward = await this.collectionForType(ActivityType.Reward)
        .where('type', '==', ActivityType.Reward)
        .orderBy('updatedAt', 'desc')
        .limit(1)
        .get()

      const result = lastReward.docs.filter(x => !x.data().seenAt)

      if (result.length === 0) {
        return
      }

      const activity = reader(result[0].data(), Activity)
      this.activityUtilsService.floorActivityAmount(activity)

      this.activityStore.push(activity)
      this.activityStore.setLatestUnseenReward(activity)

      return activity.uid
    } catch (err) {
      this.monitoring.exception(err)
    }
  }

  private handleSnapshot(snapshot: FirebaseFirestoreTypes.QuerySnapshot<Activity>): void {
    for (const change of snapshot.docChanges()) {
      const activityUid = change.doc.id
      const activity = reader(change.doc.data(), Activity)

      this.activityUtilsService.floorActivityAmount(activity)

      switch (change.type) {
        case 'added':
        case 'modified':
          this.activityStore.push(activity)
          break
        case 'removed':
          this.activityStore.remove(activityUid)
          break
        default:
          this.monitoring.exception(`handleSnapshot: got a change with an unknown type = ${change.type}`)
      }
    }
  }

  private handleSnapshotError(error: Error): void {
    this.monitoring.exception(error)
  }

  private getActivityCollection(fireUserId: string, type: ActivityType) {
    switch (type) {
      case ActivityType.Reward:
        return `user/${fireUserId}/activity-reward`
      case ActivityType.Transfer_Receive:
      case ActivityType.Transfer_Send:
        return `user/${fireUserId}/activity-transfer`
      case ActivityType.Card:
        return `user/${fireUserId}/activity-card`
      case ActivityType.OnChain:
        return `user/${fireUserId}/activity-on-chain`
      case ActivityType.Lock:
        return `user/${fireUserId}/activity-lock`
      default:
        return `user/${fireUserId}/activity`
    }
  }

  private getActivityCollections(fireUserId: string) {
    const collectionForTypes = Object.keys(ActivityType).map(key => {
      const value = ActivityType[key]

      return this.getActivityCollection(fireUserId, value)
    })

    return [...new Set(collectionForTypes)]
  }

  private collectionForType(type: ActivityType): FirebaseFirestoreTypes.CollectionReference<Activity> | null {
    if (!this.userStore.me) {
      return null
    } else {
      const fireUserId = this.userStore.me.fireUserId
      const activityCollection = this.getActivityCollection(fireUserId, type)

      return firestore().collection<Activity>(activityCollection)
    }
  }

  private collections(): FirebaseFirestoreTypes.CollectionReference<Activity>[] {
    if (!this.userStore.me) {
      return []
    } else {
      const fireUserId = this.userStore.me.fireUserId
      const activityCollections = this.getActivityCollections(fireUserId)

      return activityCollections.map(x => firestore().collection<Activity>(x))
    }
  }
}
