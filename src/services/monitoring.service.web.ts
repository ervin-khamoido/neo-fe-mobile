import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

import { IMonitoringConfig } from '../models/config'

export const AppMonitoringServiceSymbol = Symbol.for('IAppMonitoringService')

export interface IMonitoringService {
  initialize(): void

  assert(condition: any, message: string): void
  breadcrumb(message: string): void
  message(category: string, message: string): void
  exception(message: string): void
}

export class ConsoleMonitoringService implements IMonitoringService {
  constructor(private name: string) {}

  initialize(): void {}

  assert(condition: any, message: string): void {
    if (!condition) {
      console.warn(`${this.name} Assert: ${message}`)
    }
  }

  breadcrumb(message: string): void {
    console.log(`${this.name} Breadcrumb: ${message}`)
  }

  message(category: string, message: string): void {
    console.log(`${this.name} Message: ${message}`)
  }

  exception(message: string): void {
    console.warn(`${this.name} Error: ${message}`)
  }
}

export class SentryService implements IMonitoringService {
  constructor(private name: string, private configs: IMonitoringConfig) {}

  initialize() {
    Sentry.init({ dsn: this.configs.dsn, integrations: [new Integrations.BrowserTracing()] })
  }

  assert(condition: any, message: string): void {
    if (!condition) {
      Sentry.captureMessage(`[${this.name}] ${message}`, { level: Sentry.Severity.Warning })
    }
  }

  breadcrumb(message: string): void {
    Sentry.addBreadcrumb({ type: 'navigation', message: `[${this.name}] ${message}` })
  }

  message(category: string, message: string): void {
    Sentry.captureMessage(`[${this.name}] ${message}`)
  }

  exception(message: string): void {
    Sentry.captureException(new Error(message))
  }
}
