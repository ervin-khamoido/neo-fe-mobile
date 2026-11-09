2021

import { inject, injectable } from 'inversify'
import Toast from 'react-native-toast-notifications'

import { ToastFactorySymbol } from '../symbols'
import { colors } from '../common/constrants'
import _ from 'lodash'

export const ToastServiceSymbol = Symbol.for('IToastService')

export interface IToastService {
  success(msg: string, duration?: number)
  error(msg: string, duration?: number)
  info(msg: string, duration?: number)
}

@injectable()
export class ToastService implements IToastService {
  @inject(ToastFactorySymbol) instanceFactory!: () => Toast | null

  success(msg: string, duration = 2000) {
    const instance = this.instanceFactory()

    instance?.show(msg, { type: 'success', duration, placement: 'top', successColor: colors.primary })
  }

  error(msg: string, duration = 2000) {
    if (_.isEmpty(msg)) {
      return
    }

    const instance = this.instanceFactory()

    instance?.show(msg, { type: 'danger', duration, placement: 'top', dangerColor: colors.danger })
  }

  info(msg: string, duration = 1000) {
    const instance = this.instanceFactory()

    instance?.show(msg, { type: 'normal', duration, placement: 'top' })
  }
}
