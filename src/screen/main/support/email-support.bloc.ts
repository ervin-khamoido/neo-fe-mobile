import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'
import { NavigationParamsSymbol } from '../../../ioc/component.scope'
import { SupportInput } from '../../../models/input/support.input'
import { FormFieldName, FormValues, setFormValue } from '../../../lib/utils/form'

import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'
import { ISupportStore, SupportStoreSymbol } from '../../../services/store/support.store'
import { ConnectionError } from '@ts-awesome/request'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { screenAnalytics } from '../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../services/analytics/analytics.service'

type ContactSupportParams = MainNavigatorDef['EmailSupport']

@screenAnalytics(AnalyticsFlow.Support, AnalyticsScreen.Support_Email, (_, params) => ({ mode: params.mode }))
@breadcrumb('Email Support')
@injectable()
export class EmailSupportBLoC implements IBLoC<unknown, ContactSupportParams> {
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(ToastServiceSymbol) toast!: IToastService

  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  @inject(NavigationParamsSymbol) @observable params!: ContactSupportParams

  @observable loading = false
  @observable successfullySent = false

  @observable data: FormValues<SupportInput> = {
    issue: '',
    description: '',
  }

  @computed get disabled() {
    return !this.data.issue || !this.data.description
  }

  @computed get articleTitle() {
    const article = this.supportStore.getArticle(this.params.id)

    return article?.title
  }

  @computed get issues() {
    return [...this.supportStore.helpCenterArticles.map(x => x.title), 'Something else...']
  }

  constructor() {
    makeObservable(this)

    setTimeout(() => this.initialize())
  }

  @flow *initialize() {
    this.data.issue = this.articleTitle ?? ''

    yield this.supportService.syncHelpCenter()
  }

  @action onParamsChange(_, params) {
    this.params = params
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  @flow *onSubmit() {
    this.loading = true

    try {
      yield this.supportService.contactSupport(this.data as SupportInput)
      this.successfullySent = true
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toast.error('Service temporary unavailable')
      } else {
        this.toast.error(err.message)
      }
    } finally {
      this.loading = false
    }
  }

  onDone() {
    this.navigationService.back()
  }
}
