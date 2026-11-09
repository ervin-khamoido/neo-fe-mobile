import { injectable } from 'inversify'

import { Activity } from '../../models'
import { floorAmount, TWO_DECIMAL_CONFIG } from '../../utils/amount'

export interface IActivityUtilsService {
  floorActivityAmount(activity: Activity): void
}

export const ActivityUtilsServiceSymbol = Symbol.for('IActivityUtilsService')

@injectable()
export class ActivityUtilsService implements IActivityUtilsService {
  floorActivityAmount(activity: Activity): void {
    activity.amount = floorAmount(activity.amount, TWO_DECIMAL_CONFIG)
    activity.amountUsdc = floorAmount(activity.amountUsdc, TWO_DECIMAL_CONFIG)
  }
}
