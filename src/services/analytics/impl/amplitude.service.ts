import * as amplitude from '@amplitude/analytics-react-native'
import { inject, injectable, named } from 'inversify'
import { ServerZone } from '@amplitude/analytics-types/lib/esm/server-zone'

import { AmplitudeConfigSymbol, IAmplitudeConfig } from '../../../models/config/amplitude.configs'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../../monitoring.service'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  CloseScreenPayload,
  IAnalyticsImplementation,
  ScreenPayload,
  SelectOptionPayload,
  SubmitPayload,
  TapPayload,
} from '../analytics.service'
import { Identify } from '@amplitude/analytics-react-native'

@injectable()
export class AmplitudeService implements IAnalyticsImplementation {
  @inject(AppMonitoringServiceSymbol) @named('AmplitudeService') monitoring!: IMonitoringService
  @inject(AmplitudeConfigSymbol) config!: IAmplitudeConfig

  async initialize(): Promise<void> {
    try {
      const result = amplitude.init(this.config.key, null, {
        serverZone: this.config.serverZone as ServerZone,
        trackingOptions: {
          adid: false,
        },
      })
      await result.promise
    } catch (error) {
      this.monitoring.exception(error)
    }
  }

  // internal
  private identify = new Identify()

  setUserId(id: string | undefined) {
    amplitude.setUserId(id)
  }

  setUserProperty(name: string, value: string | number | boolean) {
    this.identify.set(name, value)
    amplitude.identify(this.identify)
  }

  // auth
  openScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    amplitude
      .logEvent(AnalyticsEvent.Screen, {
        action: AnalyticsEventAction.Open,
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  skipScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    amplitude
      .logEvent(AnalyticsEvent.Screen, {
        action: AnalyticsEventAction.Skip,
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  closeScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: CloseScreenPayload): void {
    amplitude
      .logEvent(AnalyticsEvent.Screen, {
        action: AnalyticsEventAction.Close,
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  selectOption(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SelectOptionPayload): void {
    amplitude
      .logEvent(AnalyticsEvent.Select, {
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  tap(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: TapPayload): void {
    amplitude
      .logEvent(AnalyticsEvent.Tap, {
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  submit(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SubmitPayload) {
    amplitude
      .logEvent(AnalyticsEvent.Submit, {
        flow: flow,
        screen: screen,
        ...payload,
      })
      .promise.catch(this.handleError)
  }

  private handleError(err) {
    this.monitoring.exception(err)
  }
}

enum AnalyticsEvent {
  Screen = 'screen',
  Select = 'select',
  Submit = 'submit',
  Tap = 'tap',
}

enum AnalyticsEventAction {
  // screen
  Open = 'open',
  Skip = 'skip',
  Close = 'close',
}
