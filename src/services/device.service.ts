import { AppState, AppStateStatus, NativeEventSubscription, Share } from 'react-native'
import { inject, injectable } from 'inversify'
import * as Keychain from 'react-native-keychain'
import NetInfo from '@react-native-community/netinfo'
import InAppReview from 'react-native-in-app-review'

import { IPINService, PINServiceSymbol } from './pin.service'
import { DeviceStoreSymbol, IDeviceStore } from './store/device.store'
import Clipboard from '@react-native-clipboard/clipboard'
import { colors } from '../common/constrants'
import { BuildInfoNativeModuleSymbol, IBuildInfoNativeModule } from './native-module/build-info.nm'
import { IToastService, ToastServiceSymbol } from './toast.service'
import { IOrdersStore, OrdersStoreSymbol } from './store/orders.store'

export interface IDeviceService {
  initialize(): Promise<void>

  copyInClipboard(value: string): void
  shareText(msg: string, options: ShareOptions): Promise<boolean>
  syncBuildInfo(): Promise<void>
  shareTextOnly(msg: string, title?: string): Promise<boolean>
  provideFeedback(): void
}

export const DeviceServiceSymbol = Symbol.for('IDeviceService')

@injectable()
export class DeviceService implements IDeviceService {
  @inject(PINServiceSymbol) pinService!: IPINService
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore
  @inject(ToastServiceSymbol) toastService!: IToastService

  @inject(OrdersStoreSymbol) ordersStore!: IOrdersStore

  @inject(BuildInfoNativeModuleSymbol) buildInfoNM!: IBuildInfoNativeModule

  private initialized = false
  private appStateSub: NativeEventSubscription | null = null

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    const currentAppState = AppState.currentState
    const supportedBiometric = await Keychain.getSupportedBiometryType()

    this.deviceStore.setAppState(currentAppState)
    this.deviceStore.setBiometricAvailable(!!supportedBiometric)

    this.appStateSub = AppState.addEventListener('change', state => this.onAppState(state))

    //Connectivity
    NetInfo.fetch().then(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.deviceStore.setAppIsConnectedToInternet(true)
      } else {
        this.deviceStore.setAppIsConnectedToInternet(false)
      }
    })
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        this.deviceStore.setAppIsConnectedToInternet(true)
      } else {
        this.deviceStore.setAppIsConnectedToInternet(false)
      }
    })
    //Connectivity

    this.initialized = true
  }

  async deinitialize() {
    this.appStateSub.remove()
    this.initialized = false
  }

  copyInClipboard(value: string): void {
    Clipboard.setString(value)
  }

  async shareText(msg: string, options: ShareOptions): Promise<boolean> {
    const result = await Share.share(
      { message: msg, url: options.url },
      { dialogTitle: options.title, subject: options.emailSubject, tintColor: colors.primary },
    )

    return result.action === Share.sharedAction
  }

  async shareTextOnly(value: string, title?: string): Promise<boolean> {
    const result = await Share.share({ message: value, title }, { dialogTitle: title, tintColor: colors.primary })

    return result.action === Share.sharedAction
  }

  async syncBuildInfo() {
    const info = await this.buildInfoNM.getAll()
    this.deviceStore.setBuildInfo(info)
  }

  async provideFeedback() {
    try {
      const isAvailable = InAppReview.isAvailable()

      if (isAvailable) {
        const hasFlowFinishedSuccessfully = await InAppReview.RequestInAppReview()
        // when return true in android it means user finished or close review flow
        // when return true in ios it means review flow launched to user.
        if (hasFlowFinishedSuccessfully && !this.ordersStore.isFirstTransactionMade) {
          this.ordersStore.setIsFirstTransactionMade(true)
          this.toastService.success('Thanks for your feedback!')
        }
      }
    } catch (err) {
      this.toastService.error('Something went wrong. Try again later')
    }
  }

  private async onAppState(state: AppStateStatus) {
    this.deviceStore.setAppState(state)
  }
}

type ShareOptions = {
  title: string
  url: string
  emailSubject?: string
}
