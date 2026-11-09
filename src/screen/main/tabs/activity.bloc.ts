import { inject, injectable, named } from 'inversify'
import { IBLoC } from '../../../ioc'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { breadcrumb } from '../../../utils/breadcrumb'

@breadcrumb('Activity Tabs')
@injectable()
export class ActivityBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('Activity') monitoring!: IMonitoringService

  trackBreadcrumb(route: string) {
    this.monitoring.breadcrumb(`Switching Tab =>: ${route}`)
  }

  constructor() {
    // makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }
}
