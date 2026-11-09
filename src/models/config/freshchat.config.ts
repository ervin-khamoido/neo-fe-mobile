import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export interface IFreshchatConfig {
  readonly appId: string
  readonly appKey: string
  readonly domain: string
}

export const FreshchatConfigSymbol = Symbol.for('IFreshchatConfig')

@injectable()
export class FreshchatConfig implements IFreshchatConfig {
  readonly appId: string
  readonly appKey: string
  readonly domain: string

  constructor(config: IConfig) {
    this.appId = config.get<string>('FRESHCHAT_APP_ID')
    this.appKey = config.get<string>('FRESHCHAT_APP_KEY')
    this.domain = config.get<string>('FRESHCHAT_DOMAIN')
  }
}
