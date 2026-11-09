import { inject, injectable } from 'inversify'

import { IBLoC } from '../ioc'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
  ScreenPayload,
} from '../services/analytics/analytics.service'
import { InitialPropsSymbol, NavigationParamsSymbol } from '../ioc/component.scope'

export function screenAnalytics<TProps = any, TParams = any>(
  flow: AnalyticsFlow,
  screen: AnalyticsScreen,
  extraProps?: ExtraPropsFunc<TProps, TParams>,
) {
  return function <T extends { new (...rest: any[]): IBLoC<TProps, TParams> }>(Class: T) {
    @injectable()
    class ScreenAnalyticsWrapper extends Class implements IBLoC {
      @inject(AnalyticsServiceSymbol) __analyticsService!: IAnalyticsService

      @inject(InitialPropsSymbol) __props!: TProps
      @inject(NavigationParamsSymbol) __params!: TParams

      private isBlurred = false

      onScreenFocus() {
        const p = extraProps?.(this.__props, this.__params, true)
        this.__analyticsService.openScreen(flow, screen, p)

        super.onScreenFocus?.()
      }

      onScreenBlur() {
        this.isBlurred = true

        super.onScreenBlur?.()

        const p = extraProps?.(this.__props, this.__params, false)
        this.__analyticsService.closeScreen(flow, screen, p)
      }

      onDestroy() {
        super.onDestroy?.()

        if (!this.isBlurred) {
          const p = extraProps?.(this.__props, this.__params, false)
          this.__analyticsService.closeScreen(flow, screen, p)
        }
      }
    }

    return ScreenAnalyticsWrapper
  }
}

type ExtraPropsFunc<TProps, TParams> = (props: TProps, params: TParams, open: boolean) => ScreenPayload
