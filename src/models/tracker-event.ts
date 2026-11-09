import { readable } from '@ts-awesome/model-reader'

export enum EventTypes {
  'Tap' = 'Tap',
  'ScreenView' = 'ScreenView',
  'Toggle' = 'Toggle',
  'Submit' = 'Submit',
}

class BaseEvent {
  @readable(String) screen: string
  @readable(String) subScreen: string
  // e.g authentication
  @readable(String) flow: string
  @readable(String) eventType: EventTypes
}

export class PageViewEventProps extends BaseEvent {}

export class TapEventProps extends BaseEvent {
  // slugs e.g saved_accounts
  @readable(String) eventInfo: string
  // user is submiting phone number
  @readable(String) eventDetails: string
}

export class SubmitEventProps extends TapEventProps {}

export class ToggleEventProps extends TapEventProps {
  // 1 or 0
  @readable(String) toggleState?: number
}
