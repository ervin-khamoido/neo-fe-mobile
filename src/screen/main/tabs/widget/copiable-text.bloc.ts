import { inject, injectable } from 'inversify'
import { action, computed, makeObservable } from 'mobx'
import Clipboard from '@react-native-clipboard/clipboard'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { InitialPropsSymbol } from '../../../../ioc/component.scope'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'

import { CopiableTextWidgetProps } from './copiable-text.widget'

@injectable()
export class CopiableTextBLoC implements IBLoC<CopiableTextWidgetProps> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(InitialPropsSymbol) props!: CopiableTextWidgetProps

  @computed get text() {
    return this.props.copyText
  }

  @computed get showCopyIcon() {
    return !!this.props.showCopyIcon
  }

  constructor() {
    makeObservable(this)
  }

  @action onTextCopy() {
    Clipboard.setString(this.props.copyText)
    this.toast.info('Copied to clipboard')
  }

  @action onParamsChange(props: CopiableTextWidgetProps) {
    this.props = props
  }
}
