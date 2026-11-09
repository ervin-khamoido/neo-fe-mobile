import { inject, injectable, named } from 'inversify'
import { action, computed, makeObservable, observable } from 'mobx'

import { IBLoC } from '../ioc'

import { SelectWidgetProps } from './select.widget'
import { InitialPropsSymbol } from '../ioc/component.scope'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../services/monitoring.service'

@injectable()
export class SelectBLoC<T extends BaseItem> implements IBLoC<SelectWidgetProps<T>> {
  @inject(InitialPropsSymbol) @observable props!: SelectWidgetProps<T>
  @inject(AppMonitoringServiceSymbol) @named('Select') monitoring!: IMonitoringService

  @computed get value() {
    return this.props.value
  }

  @computed get title() {
    const { items, valueSelector } = this.props

    const item = items.find(x => valueSelector(x) === this.value)
    if (!item) {
      return this.value
    }

    return this.props.titleSelector(item)
  }

  @computed get placeholder() {
    return this.props.placeholder
  }

  @computed get items(): T[] {
    const { searchHandler, items } = this.props

    const result: (T | SpecialItem)[] = searchHandler(this.search, items)
    if (this.props.enableToSelectTheInput && this.search) {
      result.unshift({
        specialItem: true,
        label: `Use the entered City as is: ${this.search}`,
        value: this.search,
      })
    }

    return result as T[]
  }

  @observable showList = false
  @observable search = ''

  constructor() {
    makeObservable(this)
  }

  @action onSelectPress() {
    this.showList = true
  }

  @action onPopUpClose() {
    this.search = ''
    this.showList = false
  }

  @action onItemSelect(item: T | SpecialItem) {
    const { name, valueSelector, onChange } = this.props

    let value
    if (item.specialItem) {
      value = item.value
    } else {
      value = valueSelector(item as T)
    }

    onChange(name, value)
    this.onPopUpClose()
  }

  @action onSearchChange(value: string) {
    this.search = value
  }

  @action onParamsChange(props: SelectWidgetProps<T>) {
    this.props = props
  }
}

export type BaseItem = {
  specialItem?: false
}

export type SpecialItem = {
  specialItem: true
  label: string
  value: string
}
