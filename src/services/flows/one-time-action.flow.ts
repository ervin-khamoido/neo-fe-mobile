import { inject, injectable } from 'inversify'
import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { MainNavigatorDef } from '../../screen/common'
import { OneTimeAction } from '../pin.service'
import { WizardCloseError } from '../../models/error/wizard-close.error'
import { RequestError } from '@ts-awesome/request'
import { StatusCode } from '../../common/constrants'
import { UnauthorizedReason } from '../api.service'
import { IUserStore, UserStoreSymbol } from '../store/user.store'

type RequestCallback<T> = () => Promise<T>

export interface IOneTimeActionResult<T> {
  fulfilled: boolean
  result: T | undefined
}

export interface IOneTimeActionFlow {
  auto<T>(action: OneTimeAction, request: RequestCallback<T>): Promise<IOneTimeActionResult<T>>

  processOneTimeAction<T>(request: RequestCallback<T>): Promise<T>
}

export const OneTimeActionFlowSymbol = Symbol.for('IOneTimeActionFlow')

@injectable()
export class OneTimeActionFlow implements IOneTimeActionFlow {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(UserStoreSymbol) userStore!: IUserStore

  async processOneTimeAction<T>(request: RequestCallback<T>): Promise<T> {
    try {
      return await request()
    } catch (err) {
      this.handleError(err)
    }
  }

  async auto<T>(action: OneTimeAction, request: RequestCallback<T>): Promise<IOneTimeActionResult<T>> {
    const { settings } = this.userStore
    try {
      if (settings?.enableAppLock) {
        await this.navigationService.wizard('RequestOneTimeAction', { action })
      }

      const result = await request()
      return { fulfilled: true, result }
    } catch (err) {
      this.handleError(err)
    }

    return { fulfilled: false, result: undefined }
  }

  private handleError(err: any): never | void {
    if (err instanceof WizardCloseError) {
      // ignore
    } else if (err instanceof RequestError && err.statusCode === StatusCode.Unauthorized) {
      const { reason } = err.data ?? {}

      if (reason === UnauthorizedReason.OneTimeToken) {
        throw new Error('User is not authorized to perform the action')
      } else {
        // should never occur
        throw err
      }
    } else {
      throw err
    }
  }
}
