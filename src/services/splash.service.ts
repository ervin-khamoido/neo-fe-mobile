2021

import { inject, injectable } from 'inversify'
import { EventEmitter, NativeEventEmitter, NativeModules } from 'react-native'
import { DeviceStoreSymbol, IDeviceStore } from './store/device.store'
const { RNSplashScreen } = NativeModules

export const SplashServiceSymbol = Symbol.for('ISplashService')

export interface ISplashService {
  readonly emitter: EventEmitter

  show(): void
  hide(): void
}

export const SPLASH_ANIMATION_END_EVENT = 'splash_animation_end'

@injectable()
export class SplashService implements ISplashService {
  private _emitter = new NativeEventEmitter(RNSplashScreen)

  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore

  get emitter() {
    return this._emitter
  }

  constructor() {
    RNSplashScreen.isReady().then(value => {
      if (value) {
        this.emitter.emit(SPLASH_ANIMATION_END_EVENT)
      }
    })
  }

  show() {
    RNSplashScreen.show()
    this.deviceStore.setSplashShown(true)
  }

  hide() {
    RNSplashScreen.hide()
    this.deviceStore.setSplashShown(false)
  }
}
