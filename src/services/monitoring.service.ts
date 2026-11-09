import * as Sentry from '@sentry/react-native'

import { IMonitoringConfig } from '../models/config'
import { isError } from '../lib/utils/helpers'
import { SilentError } from '../models/error/silent.error'
import { IUserStore } from './store/user.store'
import { reaction } from 'mobx'

export const AppMonitoringServiceSymbol = Symbol.for('IAppMonitoringService')

export interface IMonitoringService {
  initialize(): void

  setName(name: string): void

  assert(condition: any, message: string): void
  breadcrumb(message: string): void
  message(category: string, message: string): void
  exception(err: Error | string): void
}

export class ConsoleMonitoringService implements IMonitoringService {
  constructor(private name: string) {}

  initialize(): void {}

  setName(name: string): void {
    this.name = name
  }

  assert(condition: any, message: string): void {
    if (!condition) {
      console.warn(`${this.name} Assert: ${message}`)
    }
  }

  breadcrumb(message: string): void {
    console.log(`[${this.name}] Breadcrumb: ${message}`)
  }

  message(category: string, message: string): void {
    console.log(`[${this.name}] Message: ${message}`)
  }

  exception(err: Error | string): void {
    if (err instanceof SilentError) {
      return
    }

    const error = isError(err) ? <Error>err : new Error(<string>err)
    console.warn(`[${this.name}] Error: ${error.stack}. Message: ${error.message}`)
  }
}

export class SentryService implements IMonitoringService {
  constructor(private name: string, private configs: IMonitoringConfig, private userStore: IUserStore) {}

  initialize() {
    Sentry.init({ dsn: this.configs.dsn, environment: this.configs.publicEnv })

    reaction(
      () => this.userStore.me,
      user => {
        if (user) {
          Sentry.setUser({ id: user.uid })
        } else {
          Sentry.setUser(null)
        }
      },
    )
  }

  setName(name: string): void {
    this.name = name
  }

  assert(condition: any, message: string): void {
    // TODO: implement a configuration for the level which we want to monitor: 'warning', 'info', 'critical'
    // if (!condition) {
    //   Sentry.captureMessage(`[${this.name}] ${message}`, { level: Sentry.Severity.Warning })
    // }
  }

  breadcrumb(message: string): void {
    Sentry.addBreadcrumb({ type: 'navigation', message: `[${this.name}] ${message}` })
  }

  message(category: string, message: string): void {
    // TODO: implement a configuration for the level which we want to monitor: 'warning', 'info', 'critical'
    // Sentry.captureMessage(`[${this.name}] ${message}`)
  }

  exception(err: Error | string): void {
    if (err instanceof SilentError) {
      return
    }

    const error = isError(err) ? err : new Error(<string>err)
    Sentry.captureException(error)
  }
}
