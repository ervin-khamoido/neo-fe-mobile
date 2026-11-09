import _ from 'lodash'
import format from 'date-fns/format'
import * as semver from 'semver'
import { formatDuration, intervalToDuration } from 'date-fns'

export function formatActivityStatus(status: string): string {
  return status
    .split('_')
    .map(x => _.capitalize(x))
    .join(' ')
}

export function formatUsername(value: string): string {
  return `$${value}`
}

export function formatActivityDate(statusDatetime: Date): string {
  return format(new Date(statusDatetime), 'dd MMM yy, hh:mm aa')
}

export function isServerError(statusCode: number): boolean {
  return Math.floor(statusCode / 100) === 5
}

export function formatCardNumber(cardNumber: string, obscure = true): string[] {
  const size = cardNumber.length

  return [...cardNumber].reduce((res, curr, i) => {
    const partIndex = Math.floor(i / 4)
    res[partIndex] = res[partIndex] ?? ''
    res[partIndex] += !obscure || size - i <= 4 ? curr : '*'

    return res
  }, [])
}

export function formatPhoneNumber(phoneNumber: string, obscure = true): string[] {
  const size = phoneNumber.length

  return [...phoneNumber].reduce((res, curr, i) => {
    const partIndex = Math.floor(i / 4)
    res[partIndex] = res[partIndex] ?? ''
    res[partIndex] += !obscure || size - i <= 4 ? curr : '*'

    return res
  }, [])
}

export function formatCardExpires(month: string, year: string): string {
  return `${month.padStart(2, '0')}/${year.slice(-2)}`
}

export function isVersionSupported(currentVersion: string, minSupportedVersion: string) {
  return semver.lte(minSupportedVersion, currentVersion)
}

export function cutMiddleOfString(str: string, startCount: number = 6, endCount: number = 4) {
  let dotsFlag = true

  return [...str].reduce((res, curr, i) => {
    if (i < startCount || str.length - 1 - i < endCount) {
      return res + curr
    } else if (dotsFlag) {
      dotsFlag = false
      return res + '...'
    } else {
      return res
    }
  }, '')
}

export function formatExpirationDuration(date: Date) {
  const duration = intervalToDuration({ start: new Date(), end: date })
  const format =
    duration.years > 0
      ? ['years']
      : duration.months > 0
      ? ['months', 'days']
      : duration.days > 0
      ? ['days', 'hours']
      : duration.hours > 0
      ? ['hours']
      : duration.minutes > 0
      ? ['minutes']
      : ['second']

  return formatDuration(duration, { format })
}
