import { inject, injectable } from 'inversify'
import { action, computed, makeObservable } from 'mobx'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'
import { ActivityStoreSymbol, IActivityStore } from '../../../../services/store/activity.store'

import { UnreadBadgeProps } from './unread-badge.widget'

@injectable()
export class UnreadBadgeBLoC implements IBLoC<UnreadBadgeProps> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore

  @inject(InitialPropsSymbol) props!: UnreadBadgeProps

  @computed get unread() {
    const { activityKey } = this.props
    const unread = this.activityStore[activityKey].reduce((res, curr) => res + +curr.isNew, 0)

    return unread ? `${unread}`.padStart(2, '0') : ''
  }

  constructor() {
    makeObservable(this)
  }

  @action onParamsChange(props: UnreadBadgeProps) {
    this.props = props
  }
}
