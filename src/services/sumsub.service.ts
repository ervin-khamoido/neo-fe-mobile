2021

import { inject, injectable } from 'inversify'
import SNSMobileSDK from '@sumsub/react-native-mobilesdk-module'

import { TokenOutput } from '../models/output/token.output'

import { ApiServiceSymbol, IApiService } from './api.service'
import { ConnectionError, RequestError } from '@ts-awesome/request'
import { StatusCode } from '../common/constrants'
import { SumsubError } from '../models/error/sumsub.error'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'

export interface ISumsubService {
  launch(): Promise<void>
}

export const SumsubServiceSymbol = Symbol.for('ISumsubService')

@injectable()
export class SumsubService implements ISumsubService {
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService

  async launch(): Promise<void> {
    const accessToken = await this.requireAccessToken()
    if (!accessToken) {
      throw new SumsubError('Action is not available at the moment. Please, try again later')
    }

    const sdk = SNSMobileSDK.init(accessToken, () => this.requireAccessToken())
      .withHandlers({
        onStatusChanged: this.onStatusChanged,
        onLog: this.onLog,
        onEvent: this.onEvent,
        onActionResult: this.onActionResult,
      })
      // .withDebug(true)
      .withLocale('en') // Optional, for cases when you need to override the system locale
      .withAnalyticsEnabled(false)
      .build()

    try {
      await sdk.launch()
    } catch (err) {
      this.monitoring.exception(err)
      throw new SumsubError('Something went wrong... Please try again later.')
    }
  }

  private onStatusChanged = (event: SumsubStatusChangedEvent) => {
    // console.log('onStatusChanged: ', event)
  }

  private onLog = (event: SumsubLogEvent) => {
    // console.log('onLog: ', event)
  }

  private onEvent = (event: SumsubLogEvent) => {
    // console.log('onEvent: ', event)
  }

  private onActionResult = (event: SumsubLogEvent) => {
    // console.log('onActionResult: ', event)
  }

  private async requireAccessToken(): Promise<string | null> {
    try {
      const result = await this.api.withAuth(h => h.post('/api/v1/user/access/sumsub/token', { Model: TokenOutput }))

      return result.token
    } catch (err) {
      if (err instanceof RequestError && err.statusCode > StatusCode.ServerError) {
        throw new ConnectionError('')
      }

      return null
    }
  }
}

type SumsubStatusChangedEvent = {
  prevStatus: string
  newStatus: string
}

type SumsubLogEvent = {
  message: string
}

type SumsubSdk = {
  launch(): Promise<any>
}
