import { inject, injectable, named } from 'inversify'
import branch from 'react-native-branch'
import { IInvitationStore, InvitationStoreSymbol } from './store/invitation.store'
import reader from '@ts-awesome/model-reader'
import { LinkInvitation } from '../models'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { Platform } from 'react-native'
import {
  CampaignPersistenceServiceSymbol,
  ICampaignDetails,
  ICampaignPersistenceService,
} from './analytics/campaign-persitence.service'
import { reaction } from 'mobx'
import { IUserStore, UserStoreSymbol } from './store/user.store'

import * as amplitude from '@amplitude/analytics-react-native'

export interface ILinkService {
  initialize(): Promise<void>
}

export const LinkServiceSymbol = Symbol.for('ILinkService')

@injectable()
export class LinkService implements ILinkService {
  @inject(InvitationStoreSymbol) invitationStore!: IInvitationStore
  @inject(CampaignPersistenceServiceSymbol) persistCampaign!: ICampaignPersistenceService
  @inject(AppMonitoringServiceSymbol) @named('LinkService') monitoring!: IMonitoringService
  @inject(UserStoreSymbol) userStore!: IUserStore

  private isAdCampaign(params: Record<string, any>): boolean {
    return params.hasOwnProperty('~campaign') && params.hasOwnProperty('~advertising_partner_name')
  }

  private isQuickLinkCampaign(params: Record<string, any>): boolean {
    return params.hasOwnProperty('~campaign') && params.hasOwnProperty('~feature') && params['~feature'] === 'marketing'
  }

  /**
   *
   * @see https://help.branch.io/using-branch/docs/facebook-app-install-ads
   *
   * @param params branchIO params
   * @returns
   */
  private getAdCampaignDetails(params: Record<string, any>): ICampaignDetails {
    return {
      channel: params['~advertising_partner_name'],
      campaignId: params['~campaign_id'],
      campaignName: params['~campaign'],
      adId: params['~ad_id'],
      adName: params['~ad_name'],
      publisher: params['~secondary_publisher'],
    }
  }

  private getQuickLinkCampaignDetails(params: Record<string, any>): ICampaignDetails {
    return {
      channel: params['~channel'],
      campaignName: params['~campaign'],
    }
  }

  async initialize(): Promise<void> {
    reaction(
      () => this.userStore.me?.uid,
      uid => {
        if (uid) {
          branch.setIdentity(uid)
          branch.setRequestMetadata('$amplitude_user_id', uid)
        } else {
          branch.logout()
          branch.setRequestMetadata('$amplitude_user_id', undefined)
        }
      },
    )

    branch.setRequestMetadata('$amplitude_device_id', amplitude.getDeviceId())
    branch.setRequestMetadata('$amplitude_user_id', amplitude.getUserId())

    branch.subscribe(async ({ error, params, uri }) => {
      if (error) {
        console.error('Error from Branch: ' + error)
        return
      }

      // params will never be null if error is null
      // console.log('>>>>>>>>>> branch ', params, uri)
      // params = {
      //   '$one_time_use': false,
      //   '+click_timestamp': 1643731637,
      //   '+clicked_branch_link': true,
      //   '+is_first_session': false,
      //   '+match_guaranteed': true,
      //   '+rn_cached_initial_event': true,
      //   'email': 'igzhva@gmail.com',
      //   'referrerCode': 'TDS4NCJN',
      //   '~creation_source': 0,
      //   '~id': '1014862483793081880',
      //   '~referring_link': 'https://jto8c.test-app.link/0WNt4ibf8mb',
      // }
      // uri = https://jto8c.test-app.link/0WNt4ibf8mb

      try {
        if (params['+non_branch_link']) {
          const nonBranchUrl = params['+non_branch_link']
          // Route non-Branch URL if appropriate.
          console.log('nonBranchUrl: ', Platform.OS, nonBranchUrl)
        }

        if (params['+clicked_branch_link']) {
          // A Branch link opened.
          // Route link based on data in params
        }

        this.monitoring.message('branchIOParams', JSON.stringify(params))

        // referral checks
        if (params['referrerCode']) {
          const currentInvite = reader(params, LinkInvitation)
          this.invitationStore.setCurrentInvite(currentInvite)

          this.monitoring.message('currentInvite', JSON.stringify(currentInvite))
        } else {
          this.monitoring.message('currentInvite', 'No referral code present in the deep link')
        }

        // campaign checks
        if (this.isAdCampaign(params)) {
          const campaignDetails = this.getAdCampaignDetails(params)
          await this.persistCampaign.save(campaignDetails)
        } else if (this.isQuickLinkCampaign(params)) {
          const campaignDetails = this.getQuickLinkCampaignDetails(params)
          await this.persistCampaign.save(campaignDetails)
        }
      } catch (err) {
        this.monitoring.exception(err)
        console.log('Could not read deep link params:', params)
      }
    })
  }
}
