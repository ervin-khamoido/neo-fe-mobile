2021

import { inject, injectable, named } from 'inversify'
import { Linking } from 'react-native'

import { ConfigSymbol, IConfig } from '../../lib/utils/config'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'
import { IUserStore, UserStoreSymbol } from '../store/user.store'
import { HelpCenterCategory } from '../../models'
import { ApiServiceSymbol, IApiService } from '../api.service'
import { ISupportStore, SupportStoreSymbol } from '../store/support.store'
import { SupportInput } from '../../models/input/support.input'
import { INavigationService, NavigationServiceSymbol } from '../navigation.service'
import { MainNavigatorDef } from '../../screen/common'

export const SupportServiceSymbol = Symbol.for('ISupportService')

export interface ISupportService {
  emailSupport(options?: EmailSupportOptions): Promise<void>
  whatsappSupport(options?: WhatsAppSupportOptions): Promise<void>

  syncHelpCenter(): Promise<void>
  contactSupport(input: SupportInput): Promise<void>

  // navigation actions
  navigateToHelpCenter(): Promise<void>
}

@injectable()
export class SupportService implements ISupportService {
  @inject(AppMonitoringServiceSymbol) @named('SupportService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(ConfigSymbol) config!: IConfig
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(SupportStoreSymbol) supportStore!: ISupportStore

  async emailSupport(options?: EmailSupportOptions): Promise<void> {
    const recipient = this.config.get<string>('SUPPORT_EMAIL')
    this.monitoring.assert(recipient, 'Expected a support email not to be empty')

    const subject = options?.subject ?? 'Neobank App Support'
    const body = options?.body ?? ''

    await Linking.openURL(`mailto:${recipient}?subject=${subject}&body=${body}`)
  }

  async whatsappSupport(options?: WhatsAppSupportOptions): Promise<void> {
    const recipient = this.config.get<string>('SUPPORT_WHATSAPP_URL')
    this.monitoring.assert(recipient, 'Expected a support whatsapp url not to be empty')

    const message = encodeURI(options?.message ?? '')
    await Linking.openURL(`${recipient}?text=${message}`)
  }

  async syncHelpCenter(): Promise<void> {
    try {
      const helpCenter = await this.api.withAuth(http =>
        http.get<HelpCenterCategory[]>('/api/v1/support/help-center', { Model: [HelpCenterCategory] }),
      )

      this.supportStore.setHelpCenter(helpCenter)
    } catch (err) {
      this.monitoring.exception(err)
    }
  }

  async contactSupport(input: SupportInput): Promise<void> {
    const body = { ...input }

    await this.api.withAuth(http => http.post('/api/v1/support/contact', { body }))
  }

  // navigation actions
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>

  async navigateToHelpCenter(): Promise<void> {
    const syncPromise = this.syncHelpCenter()
    if (!this.supportStore.isHelpCenterReady) {
      await syncPromise
    }

    this.navigation.navigate('HelpCenter')
  }
}

type EmailSupportOptions = {
  subject?: string
  body?: string
}

type WhatsAppSupportOptions = {
  message?: string
}
