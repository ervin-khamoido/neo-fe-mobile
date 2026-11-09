import { injectable } from 'inversify'
import HapticFeedback from 'react-native-haptic-feedback'

export interface IHapticService {
  tapNumpad(): void
  invalidInput(): void
}

export const HapticServiceSymbol = Symbol.for('IHapticService')

@injectable()
export class HapticService implements IHapticService {
  tapNumpad(): void {
    HapticFeedback.trigger('effectClick')
  }

  invalidInput(): void {
    HapticFeedback.trigger('notificationError')
  }
}
