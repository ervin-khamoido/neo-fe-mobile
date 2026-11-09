import { inject, injectable, named } from 'inversify'
import auth from '@react-native-firebase/auth'
import { ConnectionError, HttpTransportSymbol, RequestError } from '@ts-awesome/request'

import { AuthStoreSymbol, IAuthStore } from './store/auth.store'
import { IUserStore, UserStoreSymbol } from './store/user.store'

import { EmailCodeInput, EmailInput, SignUpInput, ValidateOutput } from '../models'
import { Country } from '../utils/country-state-city/typing'
import { AppConfig, Auth, FirebaseAuth } from '../models'
import { AGENT_INFO_CACHE_TIMEOUT, StatusCode } from '../common/constrants'
import { AppConfigStoreSymbol, IAppConfigStore } from './store/app-config.store'
import { IPINService, PINServiceSymbol } from './pin.service'
import { IPINStore, PINStoreSymbol } from './store/pin.store'
import { INeobankHttpTransport } from './transport/neobank.transport'
import { ISanitizer, SanitizerSymbol } from '../utils/sanitizer'
import { TransactionAvailabilityInfo } from '../models/transaction-availability'
import { addSeconds, isBefore } from 'date-fns'
import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { InvalidPhoneError } from '../models/error/invalid-phone.error'
import { InvalidUsernameError } from '../models/error/invalid-username.error'
import { SimpleDate } from '../lib/utils/simple-date'
import { SilentError } from '../models/error/silent.error'
import { UserStatus } from '../models/user-settings'

type AuthRequestCallback<T> = (http: INeobankHttpTransport) => Promise<T>

export enum PhoneVerificationType {
  SMS = 'sms',
  WhatsApp = 'whatsapp',
}

const MIN_PHONE_NUMBER_LENGTH = 1 + 1 + 9 // + code phone

export interface IApiService {
  sendEmailCode(payload: EmailInput): Promise<void>
  resendEmailCode(): Promise<void>
  verifyEmailCode(payload: EmailCodeInput): Promise<void>

  sendPhoneCode(phone: string, type: PhoneVerificationType): Promise<void>
  resendPhoneCode(): Promise<void>
  verifyPhoneCode(code: string): Promise<string>

  signIn(): Promise<boolean>
  signUp(payload: SignUpInput): Promise<void>

  withAuth<T>(func: AuthRequestCallback<T>): Promise<T>

  syncConfig(): Promise<void>
  syncTransactionAvailabilityInfo(): Promise<void>
  validatePhone(phone: string): Promise<void>
  validateUsername(value: string): Promise<void>

  sendSignInEmailCode(payload: EmailInput): Promise<void>
  verifySignInEmailCode(payload: EmailCodeInput): Promise<string>
}

export const ApiServiceSymbol = Symbol.for('IApiService')

@injectable()
export class ApiService implements IApiService {
  @inject(AppMonitoringServiceSymbol) @named('ApiService') monitoring!: IMonitoringService

  @inject(PINServiceSymbol) pinService!: IPINService

  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PINStoreSymbol) pinStore!: IPINStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore

  @inject(SanitizerSymbol) sanitizer!: ISanitizer

  @named('neobank') @inject(HttpTransportSymbol) http!: INeobankHttpTransport

  async verifyEmailCode(payload: EmailCodeInput): Promise<void> {
    const body = { ...payload, email: this.authStore.verifyEmail }
    const { token } = await this.http.post('/api/v1/auth/email/verify', { body, Model: Auth })

    this.monitoring.assert(token, '[/api/v1/auth/email/verify] Expected to get a valid token')

    this.authStore.setToken(token)
  }

  async sendEmailCode(payload: EmailInput): Promise<void> {
    const body = { ...payload }
    await this.http.post('/api/v1/auth/email', { body })
  }

  async resendEmailCode(): Promise<void> {
    const { verifyEmail } = this.authStore

    this.monitoring.assert(verifyEmail, '[/api/v1/auth/email/verify] Expected to get a valid token')

    const body = { email: verifyEmail }
    await this.http.post('/api/v1/auth/email', { body })
  }

  async signUp(payload: SignUpInput): Promise<void> {
    const body = {
      ...payload,
      dateOfBirth: new SimpleDate(payload.dateOfBirth),
      country: Country.NG,
    }

    await this.http.post('/api/v2/auth/signup', { body, Model: Auth })
  }

  async signIn(): Promise<boolean> {
    try {
      const { exists, token } = await this.http.post('/api/v1/auth/signin', { Model: Auth })

      if (exists) {
        this.monitoring.assert(!token, 'singIn(): token expected to be empty')
      } else {
        this.authStore.setToken(token)
        this.monitoring.assert(token, 'singIn(): token expected not to empty')
      }

      return exists
    } catch (err) {
      if (err instanceof RequestError && err.statusCode === StatusCode.Unauthorized) {
        await this.handleUnauthorizedError(err)
      }

      throw err
    }
  }

  async withAuth<T>(func: AuthRequestCallback<T>): Promise<T> {
    while (true) {
      try {
        return await func(this.http)
      } catch (err) {
        if (err instanceof RequestError) {
          await this.handleRequestError(err)
        } else {
          await this.handleError(err)
        }
      }
    }
  }

  async syncConfig(): Promise<void> {
    try {
      const config = await this.http.get('/api/v1/app/config', { Model: AppConfig })

      this.appConfigStore.set(config)
    } catch (err) {
      await this.handleError(err)
    }
  }

  async syncTransactionAvailabilityInfo(): Promise<void> {
    const date = new Date(this.appConfigStore.transactionAvailabilityInfoUpdatedAt)
    const now = new Date()
    const nextSyncDate = this.appConfigStore.transactionAvailabilityInfoUpdatedAt
      ? addSeconds(date, AGENT_INFO_CACHE_TIMEOUT)
      : null

    if (nextSyncDate && isBefore(now, nextSyncDate)) {
      return
    }

    try {
      const transactionAvailabilityInfo = await this.http.get('/api/v1/transaction/availability', {
        Model: TransactionAvailabilityInfo,
      })

      this.appConfigStore.setTransactionAvailabilityInfo(transactionAvailabilityInfo, now)
    } catch (err) {
      await this.handleError(err)
    }
  }

  async validatePhone(phone: string): Promise<void> {
    const unformattedPhone = phone.match(/^\+|\d+/g)?.join('')

    const isPhoneEmpty = !unformattedPhone || (unformattedPhone.length === 1 && unformattedPhone.startsWith('+'))
    if (isPhoneEmpty) {
      throw new InvalidPhoneError('Please enter your phone number', phone)
    }

    if (!unformattedPhone.startsWith('+')) {
      throw new InvalidPhoneError(
        'International phone number is required. It should start with + sign and a country code',
        phone,
      )
    }

    if (unformattedPhone.length < MIN_PHONE_NUMBER_LENGTH) {
      throw new InvalidPhoneError('Please enter a valid phone number', phone)
    }

    try {
      const result = await this.http.post('/api/v1/auth/phone/validate', {
        Model: ValidateOutput,
        body: {
          phone: unformattedPhone,
        },
      })

      if (result.errors && result.errors.length) {
        return Promise.reject(new InvalidPhoneError(result.errors.shift(), phone))
      }
    } catch (err) {
      if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.ServerError: {
            this.monitoring.exception(err)
            throw new ConnectionError('')
          }
          default: {
            this.monitoring.exception(err)
            throw new Error('Something went wrong...')
          }
        }
      }

      throw err
    }
  }

  async validateUsername(value: string): Promise<void> {
    try {
      const result = await this.http.post('/api/v1/user/details/username/validate', {
        Model: ValidateOutput,
        body: { username: value },
      })

      if (result.errors && result.errors.length) {
        return Promise.reject(new InvalidUsernameError(result.errors.shift(), value))
      }
    } catch (err) {
      if (err instanceof RequestError) {
        switch (err.statusCode) {
          case StatusCode.ServerError: {
            this.monitoring.exception(err)
            throw new ConnectionError('')
          }
          default: {
            this.monitoring.exception(err)
            throw new Error('Something went wrong...')
          }
        }
      }

      throw err
    }
  }

  async sendPhoneCode(phone: string, type: PhoneVerificationType): Promise<void> {
    const body = { phone, type }
    await this.http.post('/api/v1/auth/phone', { body })
  }

  async resendPhoneCode(): Promise<void> {
    const { verifyPhone, verifyPhoneType } = this.authStore

    this.monitoring.assert(verifyPhone, '[/api/v1/auth/phone/verify] Expected to get a valid token')

    const body = { phone: verifyPhone, type: verifyPhoneType }
    await this.http.post('/api/v1/auth/phone', { body })
  }

  async verifyPhoneCode(code: string): Promise<string> {
    const body = { code, phone: this.authStore.verifyPhone }
    const { firebaseCustomToken } = await this.http.post('/api/v1/auth/phone/verify', { body, Model: FirebaseAuth })

    return firebaseCustomToken
  }

  async sendSignInEmailCode(payload: EmailInput): Promise<void> {
    const body = { ...payload }
    await this.http.post('/api/v1/auth/signin/email', { body })
  }

  async verifySignInEmailCode(payload: EmailCodeInput): Promise<string> {
    const body = { ...payload, email: this.authStore.verifySignInEmail }
    const { firebaseCustomToken } = await this.http.post('/api/v1/auth/signin/email/verify', {
      body,
      Model: FirebaseAuth,
    })

    this.monitoring.assert(firebaseCustomToken, '[/api/v1/auth/signin/email/verify] Expected to get a valid token')

    return firebaseCustomToken
  }

  private async handleError(err: unknown): Promise<never> {
    if (err instanceof ConnectionError) {
      throw new Error('Connection to server lost. Please try again...')
    } else {
      throw err
    }
  }

  private async handleRequestError(err: RequestError): Promise<boolean> {
    switch (err.statusCode) {
      case StatusCode.Unauthorized:
        return this.handleUnauthorizedError(err)
      default: {
        throw err
      }
    }
  }

  private async handleUnauthorizedError(err: RequestError): Promise<boolean | never> {
    const { reason } = err.data ?? {}

    if (reason === UnauthorizedReason.PinCodeToken) {
      await this.pinService.resetPINToken()
      let refreshPin = await this.pinService.refreshPIN()

      if (refreshPin) {
        this.monitoring.breadcrumb('Refreshed Pin Token')
      }

      return refreshPin
    } else if (reason === UnauthorizedReason.Blocked) {
      this.userStore.setUserStatus(UserStatus.Blocked)
      throw new SilentError()
    } else {
      await auth().signOut()
      throw new Error('User is unauthorized')
    }
  }
}

export enum UnauthorizedReason {
  PinCodeToken = 'pin_code_token',
  OneTimeToken = 'one_time_token',
  Blocked = 'blocked',
}

export enum BadRequestContextType {
  ValidationMessage = 'validation_message',
}
