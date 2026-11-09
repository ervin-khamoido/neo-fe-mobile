import AsyncStorage from '@react-native-async-storage/async-storage'
import { injectable } from 'inversify'

export const PersistanceKeys = Object.freeze({
  Store: 'neobank',
})

export interface IPersistance {
  [key: string]: any
}

export const PersistanceSymbol = Symbol.for('IPersistance')

@injectable()
export class AsyncPersistance implements IPersistance {
  [key: string]: any

  static async provide(wrappedStorage: typeof AsyncStorage): Promise<IPersistance> {
    const store: IPersistance = new AsyncPersistance()

    try {
      const raw = (await wrappedStorage.getItem(PersistanceKeys.Store)) || ''
      const parsed = JSON.parse(raw)

      for (const key of Object.keys(parsed)) {
        store[key] = parsed[key]
      }
    } catch (err) {
      // console.warn('Failed to load Store: ', err)
    }

    return new Proxy(store, {
      get(target, p: string): any {
        return target[p]
      },
      set(target, p: string, value: any): boolean {
        target[p] = value
        wrappedStorage.setItem(PersistanceKeys.Store, JSON.stringify(target))

        return true
      },
    })
  }
}
