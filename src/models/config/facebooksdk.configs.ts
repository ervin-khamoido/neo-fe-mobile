import { injectable } from 'inversify'
import { IConfig } from '../../lib/utils/config'

export interface IFacebookSDKConfig {
  readonly facebookAppId: string
  readonly trackingFeature: boolean
  readonly autoLogging: boolean
  readonly enableDebugLogging: boolean
}

export const FacebookSDKConfigSymbol = Symbol.for('IFacebookSDKConfig')

@injectable()
export class FacebookSDKConfig implements IFacebookSDKConfig {
  readonly facebookAppId: string
  readonly trackingFeature: boolean
  readonly autoLogging: boolean
  // this is used for development purposes only
  // the value should always be false when pushed to the repository
  readonly enableDebugLogging: boolean

  constructor(config: IConfig) {
    this.facebookAppId = config.get<string>('FACEBOOK_APP_ID') ?? ''
    this.trackingFeature = config.get<string>('FEATURE_FACEBOOK_PIXEL').toLowerCase() === 'true'
    this.autoLogging = config.get<string>('FACEBOOK_AUTO_LOGGING').toLowerCase() === 'true'
    this.enableDebugLogging = config.get<string>('FACEBOOK_DEBUG_LOG_ENABLE').toLowerCase() === 'true'
  }
}
