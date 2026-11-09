2021

import { inject, injectable, named } from 'inversify'
import { addMinutes, isAfter, isBefore } from 'date-fns'
import { observe } from 'mobx'
import read from '@ts-awesome/model-reader'
import { HttpTransportSymbol } from '@ts-awesome/request'

import { AppMonitoringServiceSymbol, IMonitoringService } from './monitoring.service'
import { PINOutput } from '../models/output'
import { IPINStore, PINStoreSymbol } from './store/pin.store'
import { PINRecord } from '../models/pin'
import { IUserStore, UserStoreSymbol } from './store/user.store'
import { ISecureStorage, SecureStorageSymbol, StorageAccessControl } from './secure.storage'
import { DeviceStoreSymbol, IDeviceStore } from './store/device.store'

import { INeobankHttpTransport } from './transport/neobank.transport'

const SECURE_STORAGE_REFRESH_PIN = 'refresh_pin'
const SECURE_STORAGE_BIOMETRIC_PIN = 'biometric_pin'

export const PINServiceSymbol = Symbol.for('IPINService')

// DO NOT CHANGE BUT YOU CAN ADD
export enum OneTimeAction {
  DisableAppLock = 'disable_app_lock',
  ChangePin = 'change_pin',
  CreateSellOrder = 'create_sell_order',
  CreateBuyOrder = 'create_buy_order',
  DeleteNEOBANKAccount = 'delete_neobank_account',
  CreateTransferOrder = 'create_transfer_order',
  CreateFundCardOrder = 'create_fund_card_order',
  UnfreezeCard = 'unfreeze_card',
  CreateOnChainOrder = 'create_on_chain_order',
}

export interface IPINService {
  createPIN(pin: string): Promise<void>
  changePIN(pin: string): Promise<void>
  removePIN(): Promise<void>
  forgotPIN(): Promise<void>

  resetPIN(): Promise<void>
  resetPINToken(): Promise<void>
  signInWithPIN(pin: string): Promise<boolean>
  refreshPIN(): Promise<boolean>

  requestOneTimeToken(pin: string, action: OneTimeAction): Promise<void>

  onBackground(): Promise<void>
  onForeground(): Promise<void>

  toggleBiometric(): Promise<void>
  tryBiometricSignInWithPIN(): Promise<boolean>
}

@injectable()
export class PINService implements IPINService {
  @inject(AppMonitoringServiceSymbol) @named('PINService') monitoring!: IMonitoringService
  @inject(HttpTransportSymbol) @named('neobank') http!: INeobankHttpTransport
  @inject(SecureStorageSymbol) secureStorage!: ISecureStorage

  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(PINStoreSymbol) pinStore!: IPINStore
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore

  private resolvers: (() => void)[] | null = null

  constructor() {
    setImmediate(() => this.initialize())
  }

  initialize() {
    observe(
      this.deviceStore,
      'appState',
      async change => {
        switch (change.object.get()) {
          case 'active':
            await this.onForeground()
            break
          case 'background':
            await this.onBackground()
            break
        }
      },
      true,
    )
  }

  async createPIN(pin: string): Promise<void> {
    const result = await this.http.post('/api/v1/user/pin', {
      Model: PINOutput,
      body: { pin },
    })

    await this.persist(pin)

    this.pinStore.setToken(result.token)
    this.pinStore.setRequestPIN(false)
    this.userStore.switchAppLock(true)
  }

  async changePIN(pin: string): Promise<void> {
    const result = await this.http.patch('/api/v1/user/pin', {
      Model: PINOutput,
      body: { pin },
      oneTimeAction: true,
    })

    await this.persist(pin)
    await this.updateBiometric()

    this.pinStore.setToken(result.token)
    this.pinStore.setRequestPIN(false)
  }

  async signInWithPIN(pin: string): Promise<boolean> {
    // ask server a new pin token
    const result = await this.http.post('/api/v1/user/pin/token/refresh', {
      Model: PINOutput,
      body: { pin },
    })

    // the pin must be persisted in a secure storage for subsequent refreshes
    await this.persist(pin)
    await this.updateBiometric()

    this.pinStore.setToken(result.token)
    this.pinStore.setRequestPIN(false)

    // token is updated, notify all pending promises
    await this.flushResolvers()

    this.pinStore.setRefreshing(false)

    return true
  }

  async refreshPIN(): Promise<boolean> {
    if (this.pinStore.token) {
      return
    }

    // some other request is refreshing the pin token right now
    // push current request in the queue
    // in the end "refreshPIN" will trigger all resolvers later
    if (this.pinStore.refreshing) {
      return new Promise(resolve => this.pushResolver(resolve))
    }

    this.pinStore.setRefreshing(true)

    // user tries to refresh the pin from a secure storage
    const data = await this.read()
    const pin = data?.pin

    if (!pin) {
      this.pinStore.setRequestPIN(true)

      return new Promise(resolve => this.pushResolver(resolve))
    }

    // ask server a new pin token
    const result = await this.http.post('/api/v1/user/pin/token/refresh', {
      Model: PINOutput,
      body: { pin },
    })

    // the pin must be persisted in a secure storage for subsequent refreshes
    await this.persist(pin)

    this.pinStore.setToken(result.token)
    this.pinStore.setRequestPIN(false)

    await this.flushResolvers()

    this.pinStore.setRefreshing(false)

    return true
  }

  async resetPIN(): Promise<void> {
    const { settings } = this.userStore
    if (!settings?.enableAppLock) {
      return
    }

    this.pinStore.setToken(null)
    this.pinStore.setRequestPIN(true)

    await this.secureStorage.clear(SECURE_STORAGE_REFRESH_PIN)
  }

  async forgotPIN(): Promise<void> {
    await this.http.post('/api/v1/user/pin/forgot')
  }

  async resetPINToken(): Promise<void> {
    this.pinStore.setToken(null)
  }

  async removePIN(): Promise<void> {
    await this.http.post('/api/v1/user/pin/remove', { oneTimeAction: true })

    this.userStore.switchAppLock(false)
    await this.switchBiometricOff()
  }

  async requestOneTimeToken(pin: string, action: OneTimeAction): Promise<void> {
    const result = await this.http.post('/api/v1/user/pin/token/one-time', {
      Model: PINOutput,
      body: { pin, action },
    })

    this.pinStore.setOneTimeToken(result.token)
  }

  async toggleBiometric(): Promise<void> {
    if (this.pinStore.biometricEnabled) {
      await this.switchBiometricOff()
    } else {
      const pinData = await this.read()
      await this.secureStorage.set(SECURE_STORAGE_BIOMETRIC_PIN, pinData.pin, StorageAccessControl.Biometric)
      this.pinStore.setBiometricEnabled(true)
    }
  }

  async tryBiometricSignInWithPIN(): Promise<boolean> {
    if (!this.pinStore.biometricEnabled) {
      return false
    }

    const pin: string | null = await this.secureStorage.get(SECURE_STORAGE_BIOMETRIC_PIN)

    if (!pin) {
      this.monitoring.exception('unexpected: pin code must be in storage if biometrics is enabled')
      this.pinStore.setBiometricEnabled(false)
      return false
    }

    return this.signInWithPIN(pin)
  }

  async updateBiometric(): Promise<void> {
    if (!this.pinStore.biometricEnabled) {
      return
    }

    const pinData = await this.read()
    await this.secureStorage.set(SECURE_STORAGE_BIOMETRIC_PIN, pinData.pin, StorageAccessControl.Biometric)
  }

  async onBackground(): Promise<void> {
    this.pinStore.setRefreshing(true)
    await this.persistExpiresAt()
  }

  async onForeground(): Promise<void> {
    const { settings } = this.userStore
    if (!settings || !settings?.enableAppLock) {
      return
    }

    this.pinStore.setRefreshing(true)

    const data = await this.read()
    const now = new Date()

    if (!data) {
      this.pinStore.setToken(null)
      this.pinStore.setRequestPIN(true)
    } else if (isAfter(data.lastReadAt, now)) {
      this.pinStore.setToken(null)
      this.pinStore.setRequestPIN(true)
    } else if (isAfter(now, data.expiresAt)) {
      this.pinStore.setToken(null)
      this.pinStore.setRequestPIN(true)
    }
  }

  private async switchBiometricOff() {
    await this.secureStorage.clear(SECURE_STORAGE_BIOMETRIC_PIN)
    this.pinStore.setBiometricEnabled(false)
  }

  private async pushResolver(resolver: (x: boolean) => void) {
    const confirmToken = () => resolver(true)
    if (this.resolvers) {
      this.resolvers.push(confirmToken)
    } else {
      this.resolvers = [confirmToken]
    }
  }

  private async flushResolvers() {
    if (this.resolvers) {
      for (const resolver of this.resolvers) {
        resolver()
      }
      this.resolvers = null
    }
  }

  private async persist(pin: string, expiresAt: Date | null = null) {
    const data: PINRecord = {
      pin: pin,
      lastReadAt: new Date(),
      expiresAt: expiresAt,
    }
    const raw = JSON.stringify(data)

    await this.secureStorage.set(SECURE_STORAGE_REFRESH_PIN, raw)
  }

  private async persistExpiresAt() {
    const data = await this.read()
    if (!data) {
      return
    }

    const expiresAt = addMinutes(new Date(), 1)

    await this.persist(data.pin, expiresAt)
  }

  // Developer 1: - I dont believe this is the correct spot for this [running biometric], but this is where I was testing
  // Developer 2: - "read" is done every time the pin code is updated in background
  private async read(): Promise<PINRecord | null> {
    const raw = await this.secureStorage.get(SECURE_STORAGE_REFRESH_PIN)

    if (!raw) {
      return null
    }

    const data = read(JSON.parse(raw), PINRecord)
    if (!data) {
      return null
    }

    const now = new Date()
    if (isBefore(now, data.lastReadAt)) {
      return null
    }

    // update last read at
    await this.persist(data.pin)

    return data
  }
}
