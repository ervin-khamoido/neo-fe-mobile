import { inject, injectable, postConstruct } from 'inversify'
import { action, computed, makeObservable, observable, reaction, IReactionDisposer } from 'mobx'

import { IBLoC } from '../ioc'
import { InitialPropsSymbol } from '../ioc/component.scope'

import { AppMonitoringServiceSymbol, IMonitoringService } from '../services/monitoring.service'

import { ModalMonitorProps } from './modal-monitor.widget'

@injectable()
export class ModalMonitorBLoC implements IBLoC<ModalMonitorProps> {
  @inject(InitialPropsSymbol) @observable props!: ModalMonitorProps
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService

  private subscription: IReactionDisposer | null = null

  @computed get hostComponent() {
    return this.props.hostComponentName
  }

  @computed get modalName() {
    return this.props.modalName
  }

  @computed get isVisible() {
    return this.props.isVisible
  }

  constructor() {
    makeObservable(this)
  }

  @postConstruct()
  initialize() {
    this.monitoring.setName(this.modalName)

    this.subscription = reaction(
      () => this.isVisible,
      () => {
        this.monitoring.breadcrumb(
          `${this.isVisible ? 'Open' : 'Close'} ${this.modalName}. Host component is ${this.hostComponent}`,
        )
      },
    )
  }

  @action onParamsChange(props: ModalMonitorProps) {
    this.props = props
  }

  onDestroy() {
    this.subscription?.()
  }
}
