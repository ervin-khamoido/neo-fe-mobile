/**
 * Takes a decimal number and return 2 decimal places without rounding
 *
 * @param amount: the amount that need to be floored
 * @param config: DecimalPlacesConfig defining to what precision the amount should be floored to
 * @returns (number)
 */

import { DecimalPlacesConfig } from './decimal-places-config'
import currency from 'currency.js'

export const TWO_DECIMAL_CONFIG = new DecimalPlacesConfig(2)

export function floorAmount(amount: number, config: DecimalPlacesConfig): number {
  // do not use currency here, it causes rounding whatever precision we set
  const rawAmount = Math.trunc(amount * config.decimalMultiplier)

  return currency(rawAmount, { precision: config.decimalPlaces }).divide(config.decimalMultiplier).value
}

export function exchangeAmount(amount: number, exchangeRate: number): number {
  return currency(amount).multiply(exchangeRate).value
}
