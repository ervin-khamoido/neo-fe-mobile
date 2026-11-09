import { readable } from '@ts-awesome/model-reader'

import { WaitlistFeature } from '../services/waitlist.service'

export class WaitlistItem {
  @readable(String) feature!: WaitlistFeature
  @readable(Boolean) enabled!: boolean
}
