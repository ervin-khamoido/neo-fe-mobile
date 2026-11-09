import { injectable } from 'inversify'
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

@injectable()
export class ConsoleAnalyticsService implements IAnalyticsImplementation {
  private userId: string | undefined
  private userProperties = {}

  async initialize(): Promise<void> {}

  setUserId(id: string | undefined) {
    this.userId = id
  }

  setUserProperty(name: string, value: string | number | boolean) {
    this.userProperties[name] = value
  }

  openScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    this.logEvent(`screen->open->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  skipScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: ScreenPayload): void {
    this.logEvent(`screen->skip->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  closeScreen(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: CloseScreenPayload): void {
    this.logEvent(`screen->close->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  selectOption(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SelectOptionPayload): void {
    this.logEvent(`select->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  submit(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: SubmitPayload) {
    this.logEvent(`submit->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  tap(flow: AnalyticsFlow, screen: AnalyticsScreen, payload?: TapPayload): void {
    this.logEvent(`tap->${flow}->${screen}, payload:${JSON.stringify(payload)}`)
  }

  private logEvent(event: string): void {
    console.log(`Analytics | User ${this.userId} | Event ${event}`)
  }
}
