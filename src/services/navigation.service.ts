import { inject, injectable, named } from 'inversify'
import { NavigationContainerRef, CommonActions } from '@react-navigation/core'
import { StackActions } from '@react-navigation/native'

import { NavigatorFactorySymbol } from '../symbols'
import { IWizardService, WizardServiceSymbol } from './wizard.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

export const NavigationServiceSymbol = Symbol.for('INavigationService')

type StackDef = { [key: string]: undefined | Record<string, unknown> }
type NavRoute<TStack extends StackDef> = keyof TStack
type NavParams<TStack extends StackDef, T extends NavRoute<TStack>> = TStack[T] //Record<string, string | number>

export interface INavigationService<TStack extends StackDef> {
  navigate<Route extends NavRoute<TStack>>(route: Route, params?: NavParams<TStack, Route>): void
  replace(route: NavRoute<TStack>, params?: NavParams<TStack, NavRoute<TStack>>): void
  reset(routes: NavRoute<TStack>[], params: (NavParams<TStack, NavRoute<TStack>> | undefined)[]): void
  back(): void

  wizard<T>(route: NavRoute<TStack>, params?: NavParams<TStack, NavRoute<TStack>>, wizardId?: string): Promise<T>
}

@injectable()
export class NavigationService<TStack extends StackDef> implements INavigationService<TStack> {
  @inject(AppMonitoringServiceSymbol) @named('NavigationService') monitoring!: IMonitoringService
  @inject(NavigatorFactorySymbol) navigatorFactory!: () => NavigationContainerRef<TStack>
  @inject(WizardServiceSymbol) wizardService!: IWizardService

  constructor() {
    setImmediate(() => {})
  }

  navigate<Route extends NavRoute<TStack>>(route: Route, params?: NavParams<TStack, Route>): void {
    const navigator = this.navigatorFactory()
    if (!navigator?.isReady()) {
      return
    }

    navigator.navigate(route as any, params as any)
  }

  replace(route: NavRoute<TStack>, params?: NavParams<TStack, NavRoute<TStack>>): void {
    const navigator = this.navigatorFactory()
    if (!navigator?.isReady()) {
      this.monitoring.assert(false, 'Unexpected: navigator is not ready when calling replace()')
      return
    }

    navigator.dispatch(StackActions.replace(route as string, params))
  }

  reset(routes: NavRoute<TStack>[], params: (NavParams<TStack, NavRoute<TStack>> | undefined)[]): void {
    const navigator = this.navigatorFactory()
    if (!navigator?.isReady()) {
      this.monitoring.assert(false, 'Unexpected: navigator is not ready when calling reset()')
      return
    }

    const resetAction = CommonActions.reset({
      index: 0,
      routes: routes.map((x, i) => ({
        name: x as string,
        params: params[i],
      })),
    })
    navigator.dispatch(resetAction)
  }

  back(): void {
    const navigator = this.navigatorFactory()
    if (!navigator?.isReady()) {
      this.monitoring.assert(false, 'Unexpected: navigator is not ready when calling back()')
      return
    }

    navigator?.goBack()
  }

  async wizard<T, Route extends NavRoute<TStack>>(
    route: Route,
    params?: NavParams<TStack, Route>,
    id?: string,
  ): Promise<T> {
    const handler = wizardId => this.navigate(route, { ...params, wizardId })

    if (id) {
      return this.wizardService.continue(id, handler)
    } else {
      return this.wizardService.start(handler)
    }
  }
}
