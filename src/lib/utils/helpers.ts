import { format, parseISO, isToday, formatRelative } from 'date-fns'
import { Buffer } from 'buffer'
import currency from 'currency.js'
import { format as tzFormat, utcToZonedTime } from 'date-fns-tz'

import { ConstructorOf } from '@ts-awesome/request/dist/interfaces'
import reader from '@ts-awesome/model-reader'

import { AmountSize } from '../../models/numbers'
import { CurrencyCode, CurrencyInfo } from '../../common/constrants'

const DefaultFormatOptions = { negativePattern: '(#)', pattern: '#', separator: ',', decimal: '.', precision: 2 }

const percentConfig = { precision: 2, symbol: '%', pattern: '#!', negativePattern: '-#!' }

export function date(value: string) {
  return format(parseISO(value), 'dd-MM-yyyy')
}

export function formatActivityDate(value: Date): string {
  // Outputs like: "today at 04:30 AM", "yesterday at 1:00 PM", "Sunday at 04:30 AM", "23/03/2023"
  return formatRelative(value, new Date())
}

export function readJWT<T>(token: string, model: ConstructorOf<T>): T {
  const rawPayload = token.split('.')[1]
  const payload = new Buffer(rawPayload, 'base64')

  const raw = JSON.parse(payload.toString())

  return reader(raw, model)
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

// TODO: extract from lib
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// TODO: extract from lib
// TODO: unify the method behavior for currency formatting
export function formatCurrency(value: number, currencyCode?: CurrencyCode, useSpaceInSymbol: boolean = true): string {
  const symbol = currencyCode ? CurrencyInfo[currencyCode].symbol : ''
  return currency(value, {
    ...DefaultFormatOptions,
    negativePattern: useSpaceInSymbol ? '(! #)' : '(!#)',
    pattern: useSpaceInSymbol ? '! #' : '!#',
    symbol: symbol,
  }).format()
}

/**
 * @deprecated Use formatCurrency method instead.
 */
// TODO: extract from lib
export function displayCurrency(value: number | string) {
  // must call format() at the end of any math
  // example: displayCurrency(this.balance).multiply(this.exchangeRates.sellExchangeRate).format()
  return currency(value, { ...DefaultFormatOptions })
}
// TODO: extract from lib
export function displayActivityItemCurrency(value: number): string {
  return currency(value, { ...DefaultFormatOptions, precision: 2 }).format()
}

// TODO: extract from lib
export function getFontSizeForAmount(amount: number) {
  let size: string
  let extractAmountLength = `${amount}`
  switch (extractAmountLength.length) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      size = AmountSize.Normal
      break
    case 6:
    case 7:
      size = AmountSize.Small
      break
    case 8:
      size = AmountSize.XSmall
      break
    default:
      size = AmountSize.XXSmall
      break
  }
  return size
}

// TODO: extract from lib
export function getFontSizeForWallet(amount: string) {
  let size: string
  let extractAmountLength = `${amount}`
  switch (extractAmountLength.length) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
      size = AmountSize.Large
      break
    case 8:
    case 9:
    case 10:
    case 11:
      size = AmountSize.Normal
      break
    default:
      size = AmountSize.XSmall
      break
  }
  return size
}

// TODO: extract from lib
export function formatDateInWAT(value: Date, format: string) {
  const watTZ = '+0100'

  const wat = utcToZonedTime(value, watTZ)

  return `${tzFormat(wat, format, { timeZone: watTZ })} WAT`
}

// TODO: extract from lib
export function isError(error): boolean {
  return Object.prototype.toString.call(error) === '[object Error]'
}

/**
 * Convert fractions to percentage values
 *
 * @param {number}  value - An amount to format. 1 represents 100%
 * @returns {string} Formatted amount in percentage
 */
export const formatPercentage = (value: number): string => {
  const rawPercent = currency(value, { precision: 6 }).multiply(100)
  const percent = currency(rawPercent.value, { ...percentConfig })
  const formattedPercentValue =
    percent.cents() > 0 ? percent.format() : currency(percent.dollars(), { ...percentConfig, precision: 0 }).format()

  return formattedPercentValue
}
