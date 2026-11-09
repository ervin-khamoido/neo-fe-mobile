import { inject, injectable, named } from 'inversify'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { ApiServiceSymbol, IApiService } from './api.service'
import { ReferrerInfo } from '../models/referral/referrer-info'
import { IReferralStore, ReferralStoreSymbol } from './store/referral.store'
import { ReferrerVerifyOutput } from '../models/output'

export interface IReferralService {
  syncReferralInfo(): Promise<void>
  verifyReferrer(referralCode: string): Promise<ReferrerVerifyOutput>
}

export const ReferralServiceSymbol = Symbol.for('IReferralService')

@injectable()
export class ReferralService implements IReferralService {
  @inject(AppMonitoringServiceSymbol) @named('ReferralService') monitoring!: IMonitoringService
  @inject(ApiServiceSymbol) api!: IApiService

  @inject(ReferralStoreSymbol) referralStore!: IReferralStore

  async syncReferralInfo(): Promise<void> {
    const result = await this.api.withAuth(http => http.get('/api/v1/user/referrer/info', { Model: ReferrerInfo }))

    this.referralStore.updateReferrerInfo(result)
  }

  async verifyReferrer(referralCode: string): Promise<ReferrerVerifyOutput> {
    return this.api.withAuth(http =>
      http.post('/api/v1/auth/referrer/verify', { Model: ReferrerVerifyOutput, body: { referralCode } }),
    )
  }
}
