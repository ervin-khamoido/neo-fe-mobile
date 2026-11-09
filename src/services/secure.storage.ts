import { injectable } from 'inversify'

import * as Keychain from 'react-native-keychain'
import { ACCESS_CONTROL } from 'react-native-keychain'

const BIOMETRIC_SCREEN_TITLE = 'Authenticate into Neobank'

export enum StorageAccessControl {
  None = 'none',
  Biometric = 'biometric',
}

export interface ISecureStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string, access?: StorageAccessControl): Promise<void>
  has(key: string): Promise<boolean>
  clear(key: string): Promise<void>
}

export const SecureStorageSymbol = Symbol.for('ISecureStorage')

@injectable()
export class SecureStorage implements ISecureStorage {
  private static KEYCHAIN_DEFAULT_USERNAME = 'neobank-user'

  async get(key: string): Promise<string | null> {
    const accessControl = ACToKeychainACMap[StorageAccessControl.Biometric]

    const raw = await Keychain.getInternetCredentials(key, {
      accessControl,
      authenticationPrompt: {
        title: BIOMETRIC_SCREEN_TITLE,
      },
    })

    if (raw) {
      return raw.password
    } else {
      return null
    }
  }

  async set(key: string, value: string, ac = StorageAccessControl.None): Promise<void> {
    const accessControl = ACToKeychainACMap[ac]

    await Keychain.setInternetCredentials(key, SecureStorage.KEYCHAIN_DEFAULT_USERNAME, value, {
      accessControl,
      // accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      // storage: Keychain.STORAGE_TYPE.RSA,
      authenticationPrompt: {
        title: BIOMETRIC_SCREEN_TITLE,
      },
    })
  }

  async has(key: string): Promise<boolean> {
    const result = await Keychain.hasInternetCredentials(key)

    return !!result
  }

  async clear(key: string): Promise<void> {
    await Keychain.resetInternetCredentials(key)
  }
}

const ACToKeychainACMap: Record<StorageAccessControl, ACCESS_CONTROL> = {
  [StorageAccessControl.None]: undefined,
  [StorageAccessControl.Biometric]: ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
}
