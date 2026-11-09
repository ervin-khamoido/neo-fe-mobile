import auth from '@react-native-firebase/auth'
import { fetch } from 'cross-fetch'
import { HttpMethod, IHttpTransport, Options } from '@ts-awesome/request/dist/interfaces'
import { HttpTransportBase } from '@ts-awesome/request/dist/http.transport.base'

import { IPINStore } from '../store/pin.store'
import { IAuthStore } from '../store/auth.store'
import { IConfig } from '../../lib/utils/config'
import { IUserStore } from '../store/user.store'

const AuthorizationHeader = 'Authorization'
const PinTokenHeader = 'X-PIN-TOKEN'
const OneTimeTokenHeader = 'X-ONE-TIME-TOKEN'

export type NeobankOptions = { oneTimeAction?: true; fireTokenForceRefresh?: true } & Options

export interface INeobankHttpTransport extends IHttpTransport<NeobankOptions, Response> {}

export class NeobankHttpTransport extends HttpTransportBase<NeobankOptions, Response> implements INeobankHttpTransport {
  constructor(
    private config: IConfig,
    private authStore: IAuthStore,
    private pinStore: IPINStore,
    private userStore: IUserStore,
  ) {
    super(fetch)
  }

  async request(method: HttpMethod, uri: string, options?: NeobankOptions & { timeout?: number }): Promise<Response> {
    const { settings } = this.userStore
    options.headers = options.headers ?? {}

    // one time token
    if (options?.oneTimeAction && settings?.enableAppLock) {
      const { oneTimeToken } = this.pinStore
      if (!this.pinStore.oneTimeToken) {
        throw new Error('User is not authorized to perform the action')
      }

      options.headers[OneTimeTokenHeader] = oneTimeToken

      this.pinStore.setOneTimeToken(null)
    }

    // pin token
    if (this.pinStore.token) {
      options.headers[PinTokenHeader] = `${this.pinStore.token}`
    }

    // Registration or Fire - context dependent
    const token = await this.getAuthorization(options.fireTokenForceRefresh)
    if (token) {
      options.headers[AuthorizationHeader] = token
    }

    return super.request(method, uri, options)
  }

  protected resolveRelativeUrl(method: HttpMethod, uri: string): string {
    const baseUrl = this.config.get<string>('API_ROOT')

    if (!baseUrl) {
      throw new Error(`Unable to resolve relative URL ${method} ${uri}`)
    }

    return `${baseUrl}${uri.startsWith('/') ? '' : '/'}${uri}`
  }

  private async getAuthorization(fireTokenForceRefresh: boolean = false) {
    if (this.authStore.token) {
      return `Bearer ${this.authStore.token}`
    } else {
      const token = await auth().currentUser?.getIdToken(fireTokenForceRefresh)
      return token ? `Fire-Token ${token}` : null
    }
  }
}
