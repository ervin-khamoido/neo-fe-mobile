import { inject, injectable, named } from 'inversify'
import { IBLoC } from '../../../../ioc'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'
import { breadcrumb } from '../../../../utils/breadcrumb'

@breadcrumb('Transfer Tab')
@injectable()
export class TransferBLoC implements IBLoC {
  @inject(AppMonitoringServiceSymbol) @named('Transaction') monitoring!: IMonitoringService

  trackBreadcrumb(route: string) {
    this.monitoring.breadcrumb(`Switching Tab =>: ${route}`)
  }

  constructor() {}

  onParamsChange() {
    // nothing to do here
  }
}
