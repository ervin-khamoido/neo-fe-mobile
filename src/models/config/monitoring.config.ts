import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export enum MonitoringType {
  Console = 'console',
  Sentry = 'sentry',
}

export interface IMonitoringConfig {
  readonly type: MonitoringType
  readonly dsn: string
  readonly key: string

  readonly publicEnv: string
}

export const MonitoringConfigSymbol = Symbol.for('IMonitoringConfig')

@injectable()
export class MonitoringConfig implements IMonitoringConfig {
  readonly type: MonitoringType
  readonly dsn: string
  readonly key: string

  readonly publicEnv: string

  constructor(config: IConfig) {
    this.type = config.get<MonitoringType>('ERROR_TRACKER_TYPE')
    this.dsn = config.get<string>('ERROR_TRACKER_SERVER_NAME') ?? ''
    this.key = config.get<string>('ERROR_TRACKER_KEY') ?? ''
    this.publicEnv = config.get<string>('PUBLIC_ENV') ?? 'unknown'

    if (this.type === MonitoringType.Sentry && !this.dsn) {
      throw new Error('DSN is required when using Sentry')
    }
  }
}
