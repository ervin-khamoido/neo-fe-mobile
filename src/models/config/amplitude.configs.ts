import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export interface IAmplitudeConfig {
  readonly key: string
  readonly serverZone: string
  readonly forcePushData: boolean
}

export const AmplitudeConfigSymbol = Symbol.for('IAmplitudeConfig')

@injectable()
export class AmplitudeConfig implements IAmplitudeConfig {
  readonly key: string
  readonly serverZone: string
  // this is used for development purposes only
  // the value should be always false when pushed to the repository
  readonly forcePushData: boolean = false

  constructor(config: IConfig) {
    this.key = config.get<string>('AMPLITUDE_KEY') ?? ''
    this.serverZone = config.get<string>('AMPLITUDE_SERVER_ZONE') ?? 'EU'
  }
}
