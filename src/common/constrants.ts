import { Platform } from 'react-native'

export const colors = Object.freeze({
  background: '#FFFFFF',
  accessoryBackground: '#F0F0F1',
  disabledBackground: '#F4F4F4',

  black: '#000000',
  gray: '#FAFAFA',
  gray2: '#747474',
  gray3: '#626262',
  gray4: '#E3E3E3',
  gray5: '#CCCCCC',

  input: '#FFFFFF',
  border: '#D5D5D5',
  border2: '#F4F4F4',
  borderLight1: '#E4E4E4',
  borderLight2: '#E3E3E3',
  borderActive: '#000000',

  primary: '#37BD55',
  primaryLight: 'rgba(55,189,85,0.5)',
  danger: '#C92D23',
  danger2: '#FE3F33',

  disabled: '#F4F4F4',

  text: '#000000',
  textDisabled: '#D5D5D5',
  textLight: '#FFFFFF',
  textSecondary: '#989898',
  textSecondaryDark: '#7A7A7A',
  textSecondaryLight: '#f6f6f6',

  tabInactive: 'rgba(0,0,0, 0.5)',

  warningYellow: '#FFCA0D',

  link: '#2980b9',
})

export const sizes = Object.freeze({
  margin: 20,
  gutter: 16,
  headerHeight: 80,
  tabBarHeight: 88,

  activityListInset: 24,

  // Updated Design
  marginV2: 24,
  headerHeightV2: 44,
})

export const PhoneRegex = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/i

export enum StatusCode {
  // 1xx: Informational	Communicates transfer protocol-level information.
  // 2xx: Success	Indicates that the client’s request was accepted successfully.
  OK = 200,
  Success = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  // 3xx: Redirection	Indicates that the client must take some additional action in order to complete their request.
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,
  TemporaryRedirect = 307,
  // 4xx: Client Error	This category of error status codes points the finger at clients.
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  Conflict = 409,
  Gone = 410,
  PreconditionFailed = 412,
  UnsupportedMediaType = 415,
  // 5xx: Server Error	The server takes responsibility for these error status codes.
  ServerError = 500,
  NotImplemented = 501,
}

export enum CurrencyCode {
  USD = 'usd',
  NGN = 'ngn',
}

export const CurrencyInfo: Record<CurrencyCode, { name: string; symbol: string }> = Object.freeze({
  [CurrencyCode.USD]: {
    name: 'US dollar',
    symbol: '$',
  },
  [CurrencyCode.NGN]: {
    name: 'Naira',
    symbol: '₦',
  },
})

export const AMOUNT_LIMIT = 600000000

export const CODE_RESEND_TIMEOUT = 90 // seconds

export const PIN_CODE_SIZE = 4

export const FORCE_YIELD_CACHE_UPDATE_AT: [number, number, number, number] = [3, 0, 0, 0] // 3:00:00.000

export const TERMS_AND_CONDITIONS = 'https://neobank.notion.site/neobank/Terms-Conditions-030009a685c2475691b8a2053411afec'
export const PRIVACY_POLICY_URL = 'https://neobank.notion.site/neobank/Neobank-Privacy-Policy-1cd00421bb4143cf9b4d76d5346981e0'

export const AGENT_INFO_CACHE_TIMEOUT = 12 * 60 * 60 // 12h
export const TRANSACTION_AVAILABILITY_PARSE_FORMAT = 'hh:mm:ss a XXXX'
export const TRANSACTION_AVAILABILITY_SHOW_FORMAT = 'h:mm a'

export const DEFAULT_DATE_TIME_FORMAT = 'dd MMM yyyy, hh:mm:ss'

export const STORE_LINK =
  Platform.select({
    ios: 'https://apps.apple.com/us/app/neobank-save-digital-dollars/id1638702160',
    android: 'https://play.google.com/store/apps/details?id=co.neobank.app',
  }) ?? ''

export const DATE_PATTERN = 'MMM d yyyy'
