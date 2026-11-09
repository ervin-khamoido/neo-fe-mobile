import { injectable } from 'inversify'
import { PageViewEventProps, SubmitEventProps, TapEventProps, ToggleEventProps } from '../../models'
import { IAnalyticsService } from './analytics.service'

@injectable()
export class NoAnalyticsService implements IAnalyticsService {
  init(): Promise<void> {
    return Promise.resolve()
  }

  trackAppOpen(): void {}

  trackPageview(eventProps: PageViewEventProps) {}

  trackTap(tapEventProps: TapEventProps) {}

  trackSubmit(submitEventProps: SubmitEventProps) {}

  trackToggle(toggleEventProps: ToggleEventProps) {}

  trackUser(userId: string) {}
}
