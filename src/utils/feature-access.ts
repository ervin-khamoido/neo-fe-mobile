import { Container, injectable, interfaces } from 'inversify'
import { RemoteConfig } from '../services/remote-config.service'
import { computed, makeObservable } from 'mobx'
import { WaitlistFeature } from '../services/waitlist.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../services/store/app-config.store'
import { IUserStore, UserStoreSymbol } from '../services/store/user.store'

export interface IFeatureAccess {
  readonly isFeatureEnabled: boolean
  readonly showWaitlist: boolean
  readonly isUserInWaitlist: boolean
  readonly canUserApply: boolean
}

export const FeatureAccessFactorySymbol = Symbol.for('FeatureAccessFactory')
export type FeatureAccessFactory = (
  featureFlag: RemoteConfig,
  waitlistFeatureFlag: RemoteConfig,
  waitlistFeature: WaitlistFeature,
) => IFeatureAccess

export const createFeatureAccessFactory =
  (container: interfaces.Container) =>
  (featureFlag: RemoteConfig, waitlistFeatureFlag: RemoteConfig, waitlistFeature: WaitlistFeature): IFeatureAccess =>
    new FeatureAccess(
      featureFlag,
      waitlistFeatureFlag,
      waitlistFeature,
      container.get<IAppConfigStore>(AppConfigStoreSymbol),
      container.get<IUserStore>(UserStoreSymbol),
    )

@injectable()
export class FeatureAccess implements IFeatureAccess {
  constructor(
    private featureFlag: RemoteConfig,
    private waitlistFeatureFlag: RemoteConfig,
    private waitlistFeature: WaitlistFeature,
    private appConfigStore: IAppConfigStore,
    private userStore: IUserStore,
  ) {
    makeObservable(this)
  }

  @computed get isFeatureEnabled(): boolean {
    const { remoteConfig } = this.appConfigStore

    return !!remoteConfig[this.featureFlag]
  }

  @computed get showWaitlist(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[this.waitlistFeatureFlag]
    const userIsDisabledToTryTheFeature = !waitlist.find(x => x.feature === this.waitlistFeature)?.enabled

    return waitlistFeatureActivated && userIsDisabledToTryTheFeature
  }

  @computed get isUserInWaitlist(): boolean {
    const { waitlist } = this.userStore

    return !!waitlist.find(x => x.feature === this.waitlistFeature)
  }

  @computed get canUserApply(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[this.waitlistFeatureFlag]
    const waitlistItem = waitlist.find(x => x.feature === this.waitlistFeature)
    if (waitlistFeatureActivated && waitlistItem) {
      return waitlistItem.enabled
    } else {
      return true
    }
  }
}
