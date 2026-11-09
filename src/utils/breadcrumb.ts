import { inject, injectable } from 'inversify'

import { IBLoC } from '../ioc'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../services/monitoring.service'

export function breadcrumb(name: string) {
  return function <T extends { new (...rest: any[]): IBLoC }>(Class: T) {
    @injectable()
    class BreadcrumbWrapper extends Class implements IBLoC {
      @inject(AppMonitoringServiceSymbol) monitoring: IMonitoringService

      constructor(...rest: any[]) {
        super(...rest)

        setImmediate(() => {
          this.monitoring.breadcrumb(`Open ${name}`)
        })
      }

      onDestroy() {
        super.onDestroy?.()

        this.monitoring.breadcrumb(`Close ${name}`)
      }
    }

    return BreadcrumbWrapper
  }
}
