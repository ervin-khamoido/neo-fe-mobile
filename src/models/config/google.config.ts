import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export interface IGoogleConfig {
  readonly placesApiKey: string
}

export const GoogleConfigSymbol = Symbol.for('IGoogleConfig')

@injectable()
export class GoogleConfig implements IGoogleConfig {
  readonly placesApiKey: string

  constructor(config: IConfig) {
    this.placesApiKey = config.get<string>('GOOGLE_PLACES_API_KEY')
  }
}
