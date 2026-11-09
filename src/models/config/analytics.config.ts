import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export enum AnalyticsType {
  Amplitude = 'amplitude',
  None = 'none',
}

export interface IAnalyticsConfig {
  readonly enabled: boolean
  readonly type: AnalyticsType
}

export const IAnalyticsConfigSymbol = Symbol.for('IAnalyticsConfig')

@injectable()
export class AnalyticsConfig implements IAnalyticsConfig {
  readonly enabled: boolean
  readonly type: AnalyticsType

  constructor(config: IConfig) {
    this.enabled = config.get<string>('FEATURE_ANALYTICS').toLowerCase() === 'true'
    this.type = config.get<AnalyticsType>('ANALYTICS_TYPE') ?? AnalyticsType.None
  }
}
