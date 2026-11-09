import { injectable } from 'inversify'
import { Settings, AppEventsLogger, AEMReporterIOS } from 'react-native-fbsdk-next'
import { BranchEvent } from 'react-native-branch'
import { IFacebookSDKConfig } from '../../models/config/facebooksdk.configs'
import { IMonitoringService } from '../monitoring.service'
import { ICampaignPersistenceService } from './campaign-persitence.service'

export interface ICampaignTrackingService {
  init(): void
  appLaunch(): void
  trackNewSignUp(): void
  trackBuyInitiated(currency: string): void
  trackAddBankAccount(): void
}

// IMPORTANT: These keys are predefined by Facebook. Do not change in free manner.
enum FACEBOOK_EVENT {
  INITIATED_CHECKOUT = 'fb_mobile_initiated_checkout',
}

export const CampaignTrackingServiceSymbol = Symbol.for('ICampaignTrackingService')

@injectable()
export class CampaignTrackingService implements ICampaignTrackingService {
  constructor(
    readonly facebookSDKConfig: IFacebookSDKConfig,
    private readonly persistCampaign: ICampaignPersistenceService,
    readonly monitoring: IMonitoringService,
  ) {}

  init(): void {
    try {
      Settings.initializeSDK()
      Settings.setAppID(this.facebookSDKConfig.facebookAppId)
    } catch (error) {
      this.monitoring.exception(error)
    }
  }

  /**
   * When `autoLogging` is set to `true`, Facebook auto logs `App Launch`.
   *
   * Monitor how facebook auto logs this before doing this manually
   *
   * ? Question this method answers
   * How many users from the facebook campaign opened the app
   */
  appLaunch() {}

  /**
   * ? Question this method answers
   * How many users from the facebook campaign signs up to NEOBANK app
   *
   */
  trackNewSignUp() {
    setImmediate(async () => {
      try {
        // console.log(`trackNewSignUp: started`)
        const isSignedUpTracked = await this.persistCampaign.getSignUpCompleted()
        const campaignDetails: Record<string, any> | null = await this.persistCampaign.fetch()

        if (isSignedUpTracked || !campaignDetails) {
          // console.log(`trackNewSignUp: terminated. ${isSignedUpTracked}, ${JSON.stringify(campaignDetails)}`)
          return
        }

        // Track in Branch
        const branchEvent = new BranchEvent(BranchEvent.CompleteRegistration, [], {
          customData: campaignDetails,
          description: 'User signed up successfully',
        })
        await branchEvent.logEvent()

        // Track in FB
        const eventName = AppEventsLogger.AppEvents.CompletedRegistration
        const valueToSum = 1
        const parameters = {
          [AppEventsLogger.AppEventParams.RegistrationMethod]: 'email',
          ...campaignDetails,
        }
        AppEventsLogger.logEvent(eventName, valueToSum, parameters)
        AEMReporterIOS.logAEMEvent(eventName, valueToSum, undefined, parameters)

        this.persistCampaign.saveSignUpCompleted()
        //console.log(`trackNewSignUp: compeleted`)
      } catch (error) {
        this.monitoring.exception(error)
      }
    })
  }

  /**
   * Track first save transaction
   */
  trackBuyInitiated(currency: string): void {
    setImmediate(async () => {
      try {
        //console.log(`trackBuyInitiated: started`)
        const isFirstTxTracked = await this.persistCampaign.getBuyInitiated()
        const campaignDetails: Record<string, any> | null = await this.persistCampaign.fetch()

        if (isFirstTxTracked || !campaignDetails) {
          //console.log(`trackBuyInitiated: terminated. ${isFirstTxTracked}, ${JSON.stringify(campaignDetails)}`)
          return
        }

        // Track in Branch
        const branchEvent = new BranchEvent(BranchEvent.InitiatePurchase, [], {
          currency: currency,
          description: 'User made first save transaction',
          customData: campaignDetails,
        })

        await branchEvent.logEvent()

        // Track in FB
        AppEventsLogger.logPurchase(1, currency, campaignDetails)
        AEMReporterIOS.logAEMEvent(FACEBOOK_EVENT.INITIATED_CHECKOUT, 1, currency, campaignDetails)

        this.persistCampaign.saveBuyInitiated()

        //console.log(`trackBuyInitiated: compeleted`)
      } catch (error) {
        this.monitoring.exception(error)
      }
    })
  }

  async trackAddBankAccount() {
    // try {
    //   const isBankAccountTracked = await this.isBankAccountTracked()
    //   const campaignDetails: Record<string, any> | null = await this.persistCampaign.fetch()
    //   if (isBankAccountTracked || !campaignDetails) {
    //     return
    //   }
    //   // TODO: check if this is correctly seelected event name
    //   const eventName = AppEventsLogger.AppEvents.AddPaymentInfo ?? BranchEvent.AddPaymentInfo
    //   const valueToSum = 1
    //   AppEventsLogger.logEvent(eventName, valueToSum, campaignDetails)
    //   AEMReporterIOS.logAEMEvent(eventName, valueToSum, undefined, campaignDetails)
    //   new BranchEvent(BranchEvent.AddPaymentInfo, [], {
    //     customData: campaignDetails,
    //     description: 'User added first bank account',
    //     alias: eventName,
    //   }).logEvent()
    //   this.setAddedBankAccounTracked()
    // } catch (error) {
    //   this.monitoring.exception(error)
    // }
  }
}

@injectable()
export class NoCampaignTrackingService implements ICampaignTrackingService {
  constructor() {}

  init(): void {}

  trackBuyInitiated(currency: string) {}

  appLaunch() {}

  trackNewSignUp() {}

  trackAddBankAccount() {}
}
