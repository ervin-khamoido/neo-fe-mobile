import { NativeModules, Platform } from 'react-native'
import { injectable } from 'inversify'

const { BuildInfoModule } = NativeModules

export interface IBuildInfoNativeModule {
  getAll(): Promise<Record<string, string | number | boolean>>
}

export const BuildInfoNativeModuleSymbol = Symbol.for('IBuildInfoNativeModule')

@injectable()
export class BuildInfoNativeModule implements IBuildInfoNativeModule {
  async getAll(): Promise<Record<string, string | number | boolean>> {
    // TODO: error handling

    const configs: Record<string, string> = await BuildInfoModule.getAll()
    configs['BUILD_ID'] =
      `${configs['CI_PROJECT_NAME'] || 'app'}-${configs['CI_COMMIT_REF_SLUG'] || 'default'}-` +
      `${configs['CI_PIPELINE_IID']}-${configs['CI_COMMIT_SHORT_SHA'] || 'default'}`

    return configs
  }
}
