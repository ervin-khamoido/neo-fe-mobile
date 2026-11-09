import { inject, injectable, named } from 'inversify'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { cleanable, ICleanable } from '../../utils/sanitizer'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../monitoring.service'

// IMPORTANT: These keys are saved in the user device. Think before changing!
enum STORAGE_KEY {
  'CAMPAIGN_DETAILS' = 'campaign_details',
  'SIGNED_UP' = 'campaign_signed_up',
  'FIRST_SAVE_TRANSACTION' = 'campaign_first_save_tx',
}

export interface ICampaignDetails {
  channel: string
  campaignName: string
  campaignId?: string
  adId?: string
  adName?: string
  publisher?: string
}

export interface ICampaignPersistenceService {
  save(campaignDetails: ICampaignDetails): Promise<void>
  fetch(): Promise<ICampaignDetails | null>

  saveSignUpCompleted(): Promise<void>
  getSignUpCompleted(): Promise<boolean>
  saveBuyInitiated(): Promise<void>
  getBuyInitiated(): Promise<boolean>

  clean(): void
}

export const CampaignPersistenceServiceSymbol = Symbol.for('ICampaignPersistenceService')

@cleanable
@injectable()
export class CampaignPersistenceService implements ICampaignPersistenceService, ICleanable {
  @inject(AppMonitoringServiceSymbol) @named('CampaignPersistenceService') monitoring!: IMonitoringService

  async save(campaignDetails: ICampaignDetails) {
    const _data = JSON.stringify(campaignDetails)
    await AsyncStorage.setItem(STORAGE_KEY.CAMPAIGN_DETAILS, _data)

    // console.log(`setting local storage for campaign params: key = ${STORAGE_KEY.CAMPAIGN_DETAILS}`)
    // console.log(_data)
  }

  async fetch(): Promise<ICampaignDetails | null> {
    const campaign = await AsyncStorage.getItem(STORAGE_KEY.CAMPAIGN_DETAILS)

    // console.log(`getting local storage for campaign params: key = ${STORAGE_KEY.CAMPAIGN_DETAILS}`)
    // console.log(campaign)

    if (campaign === null) {
      return null
    }

    return JSON.parse(campaign)
  }

  async saveSignUpCompleted(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY.SIGNED_UP, '1')
  }

  async getSignUpCompleted(): Promise<boolean> {
    const r = await AsyncStorage.getItem(STORAGE_KEY.SIGNED_UP)
    return r === '1'
  }

  async saveBuyInitiated(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY.FIRST_SAVE_TRANSACTION, '1')
  }

  async getBuyInitiated(): Promise<boolean> {
    const r = await AsyncStorage.getItem(STORAGE_KEY.FIRST_SAVE_TRANSACTION)
    return r === '1'
  }

  clean() {
    setImmediate(async () => {
      // console.log('cleaning up campaign')
      try {
        await Promise.all([
          AsyncStorage.removeItem(STORAGE_KEY.CAMPAIGN_DETAILS),
          AsyncStorage.removeItem(STORAGE_KEY.SIGNED_UP),
          AsyncStorage.removeItem(STORAGE_KEY.FIRST_SAVE_TRANSACTION),
        ])
      } catch (error) {
        this.monitoring.exception(error)
      }
    })
  }
}
