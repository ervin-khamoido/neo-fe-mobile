import { injectable } from 'inversify'
import _ from 'lodash'
import EnvJson from '../../../.env.json'

export const ConfigSymbol = Symbol.for('IConfig')

export interface IConfig {
  get<T>(setting: string): T
  has(setting: string): boolean
}

@injectable()
export class ReactNativeConfig implements IConfig {
  private readonly configs: Record<string, unknown> = _.cloneDeep(EnvJson)

  get<T>(setting: string): T {
    return this.configs[setting] as T
  }

  has(setting: string): boolean {
    return !!this.configs[setting]
  }
}
