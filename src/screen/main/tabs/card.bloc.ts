import { inject, injectable } from 'inversify'
import { Linking } from 'react-native'
import { action, computed, flow, makeObservable, observable } from 'mobx'

import { IBLoC } from '../../../ioc'
import { MainNavigatorDef } from '../../common'
import { breadcrumb } from '../../../utils/breadcrumb'
import { CardBrand, ScreenMode, VerifyOutput, VirtualCardStatus } from '../../../models'
import { UserLevel } from '../../../models/level/definitions'
import { LevelFlowInterruptError } from '../../../models/error/level-flow-interrupt.error'

import { AppConfigStoreSymbol, IAppConfigStore } from '../../../services/store/app-config.store'
import { ILevelStore, LevelStoreSymbol } from '../../../services/store/level.store'
import { ILevelFlowService, LevelFlowServiceSymbol } from '../../../services/level/level-flow.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { RemoteConfig } from '../../../services/remote-config.service'
import { INavigationService, NavigationServiceSymbol } from '../../../services/navigation.service'
import { IVirtualCardStore, VirtualCardStoreSymbol } from '../../../services/store/virtual-card.store'
import { formatCurrency } from '../../../lib/utils/helpers'
import { CurrencyCode, TERMS_AND_CONDITIONS } from '../../../common/constrants'
import { ISupportService, SupportServiceSymbol } from '../../../services/support/support.service'
import { formatCardExpires, formatCardNumber } from '../../../utils/helpers'
import { ActivityStoreSymbol, IActivityStore } from '../../../services/store/activity.store'
import { getScreenForActivity } from '../common'
import { CardServiceSymbol, ICardService } from '../../../services/card.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import { IWaitlistService, WaitlistFeature, WaitlistServiceSymbol } from '../../../services/waitlist.service'

import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'
import { OneTimeAction } from '../../../services/pin.service'
import { IOneTimeActionFlow, OneTimeActionFlowSymbol } from '../../../services/flows/one-time-action.flow'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../../services/analytics/analytics.service'

@breadcrumb('Card')
@injectable()
export class CardBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) navigation!: INavigationService<MainNavigatorDef>
  @inject(LevelFlowServiceSymbol) levelFlowService!: ILevelFlowService
  @inject(ToastServiceSymbol) toast!: IToastService
  @inject(CardServiceSymbol) cardService!: ICardService
  @inject(AppMonitoringServiceSymbol) monitoring!: IMonitoringService
  @inject(SupportServiceSymbol) supportService!: ISupportService
  @inject(WaitlistServiceSymbol) waitlistService!: IWaitlistService

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(LevelStoreSymbol) levelStore!: ILevelStore
  @inject(VirtualCardStoreSymbol) virtualCardStore!: IVirtualCardStore
  @inject(ActivityStoreSymbol) activityStore!: IActivityStore
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(OneTimeActionFlowSymbol) oneTimeActionFlow!: IOneTimeActionFlow

  @observable loading = false
  @observable addCashLoading = false
  @observable cashOutLoading = false
  @observable freezeLoading = false
  @observable unfreezeLoading = false
  @observable customerSupportLoading = false

  @observable showBalanceAlertModal = false
  @observable showTermsAndConditions = false
  @observable isFreezeCardConfirmModalVisible = false

  @computed get activity() {
    return this.activityStore.cardActivities.slice(0, 10)
  }

  @computed get virtualCardStatus(): VirtualCardStatus | null {
    const { remoteConfig } = this.appConfigStore
    if (!remoteConfig[RemoteConfig.VirtualCard]) {
      return VirtualCardStatus.ComingSoon
    }

    return this.virtualCardStore.cardStatusInfo.status
  }

  @computed get isWaitlistRequired(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[RemoteConfig.VirtualCardWaitlist]
    const userIsDisabledToTryTheFeature = !waitlist.find(x => x.feature === WaitlistFeature.VirtualCard)?.enabled

    return waitlistFeatureActivated && userIsDisabledToTryTheFeature
  }

  @computed get isUserInWaitlist(): boolean {
    const { waitlist } = this.userStore

    return !!waitlist.find(x => x.feature === WaitlistFeature.VirtualCard)
  }

  @computed get canUserApply(): boolean {
    const { remoteConfig } = this.appConfigStore
    const { waitlist } = this.userStore

    const waitlistFeatureActivated = !!remoteConfig[RemoteConfig.VirtualCardWaitlist]
    const waitlistItem = waitlist.find(x => x.feature === WaitlistFeature.VirtualCard)
    if (waitlistFeatureActivated && waitlistItem) {
      return waitlistItem.enabled
    } else {
      return true
    }
  }

  @computed get virtualCardBrand(): CardBrand {
    const { cardDetails } = this.virtualCardStore

    return cardDetails?.brand ?? CardBrand.Visa
  }

  @computed get displayBalance() {
    const { balance } = this.virtualCardStore

    return formatCurrency(balance, CurrencyCode.USD, false)
  }

  @computed get displayCardNumberObscured() {
    if (this.virtualCardStatus !== VirtualCardStatus.Card_Issued) {
      return formatCardNumber(NoopCardNumber)
    }

    const { cardDetails } = this.virtualCardStore
    if (!cardDetails?.cardNumber) {
      return formatCardNumber(NoopCardNumber)
    }

    return formatCardNumber(cardDetails.cardNumber)
  }

  @computed get displayCardNumber() {
    if (this.virtualCardStatus !== VirtualCardStatus.Card_Issued) {
      return formatCardNumber(NoopCardNumber, false)
    }

    const { cardDetails } = this.virtualCardStore
    if (!cardDetails?.cardNumber) {
      return formatCardNumber(NoopCardNumber, false)
    }

    return formatCardNumber(cardDetails.cardNumber, false)
  }

  @computed get displayCardExpires() {
    if (this.virtualCardStatus !== VirtualCardStatus.Card_Issued) {
      return null
    }

    const { cardDetails } = this.virtualCardStore
    if (!cardDetails) {
      return null
    }

    return formatCardExpires(cardDetails.expiryMonth, cardDetails.expiryYear)
  }

  @computed get displayCvv() {
    const { cardDetails } = this.virtualCardStore
    if (!cardDetails) {
      return null
    }

    return cardDetails.cvv
  }

  @computed get displayCardName() {
    const { cardDetails } = this.virtualCardStore
    if (!cardDetails) {
      return null
    }

    return cardDetails.cardName
  }

  @computed get billingAddress() {
    const { cardDetails } = this.virtualCardStore
    if (!cardDetails) {
      return null
    }

    return cardDetails.billingAddress
  }

  @computed get cardIssueInfo() {
    return this.virtualCardStore.cardIssueInfo
  }

  @computed get displayMinBalanceRequired() {
    return formatCurrency(this.cardIssueInfo.minBalanceRequired, CurrencyCode.USD, false)
  }

  constructor() {
    makeObservable(this)
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onIssueCardAlertModalConfirm() {
    this.showBalanceAlertModal = false
    this.navigation.navigate('Amount', { mode: ScreenMode.Buy })
  }

  @action onIssueCardAlertModalCancel() {
    this.showBalanceAlertModal = false
  }

  @action showFreezeCardConfirmModal() {
    this.isFreezeCardConfirmModalVisible = true
  }

  @action hideFreezeCardConfirmModal() {
    this.isFreezeCardConfirmModalVisible = false
  }

  @flow *onAddCash() {
    this.navigation.navigate('CardFund')
  }

  @flow *onCashOut() {
    this.navigation.navigate('CardUnload')
  }

  @flow *onFreeze() {
    this.hideFreezeCardConfirmModal()
    this.freezeLoading = true

    try {
      yield this.cardService.freezeCard()
      yield this.cardService.syncVirtualCardStatus()

      this.toast.success('Card successfully frozen')
    } catch (err) {
      this.monitoring.exception(err)
      this.toast.error('Service Temporary Unavailable')
    } finally {
      this.freezeLoading = false
    }
  }

  @flow *onUnfreeze() {
    this.hideFreezeCardConfirmModal()
    this.unfreezeLoading = true

    try {
      const result = yield this.oneTimeActionFlow.auto(OneTimeAction.UnfreezeCard, async () => {
        await this.cardService.unfreezeCard()
        await this.cardService.syncVirtualCardStatus()
      })

      if (!result.fulfilled) {
        this.toast.error('The PIN code is required to unfreeze the card.')
        return
      }

      this.toast.success('Card successfully unfrozen')
    } catch (err) {
      this.monitoring.exception(err)
      this.toast.error('Service Temporary Unavailable')
    } finally {
      this.unfreezeLoading = false
    }
  }

  @flow *onDetailPress(uid: string) {
    const activity = this.activityStore.getOne(uid)
    if (!activity) {
      return
    }

    const screen = getScreenForActivity(activity)
    this.navigation.navigate(screen, { uid })
  }

  @flow *onCustomerSupport() {
    this.customerSupportLoading = true
    yield this.supportService.navigateToHelpCenter()
    this.customerSupportLoading = false
  }

  @action onTermsAndConditionsConfirm() {
    this.showTermsAndConditions = false
    this.navigation.navigate('Bvn')
  }

  @action onTermsAndConditionsCancel() {
    this.showTermsAndConditions = false
  }

  @flow *onTermsAndConditions() {
    yield Linking.openURL(TERMS_AND_CONDITIONS)
  }

  @flow *onIssueCard() {
    this.loading = true

    if (this.isWaitlistRequired) {
      return this.onIssueCardWaitlist()
    }

    const { current } = this.levelStore.currentLevel

    try {
      if ([UserLevel.Level0, UserLevel.Level1].includes(current?.code)) {
        this.analyticsService.tap(AnalyticsFlow.Main, AnalyticsScreen.MainTabs_Card, {
          tag: 'kyc_level_upgrade',
        })

        yield this.levelFlowService.triggerNextLevelFlowSync()
      } else {
        const result: VerifyOutput = yield this.cardService.verifyVirtualCardIssuance()

        if (!result.result) {
          this.toast.error(result.reason)
          this.showBalanceAlertModal = true

          return
        }

        this.showTermsAndConditions = true
      }
    } catch (err) {
      if (err instanceof LevelFlowInterruptError) {
        // shouldn't be handled
        return
      }

      this.monitoring.exception(err)
      this.toast.error(err.message, 5000)
    } finally {
      this.loading = false
    }
  }

  @flow private *onIssueCardWaitlist() {
    if (this.isUserInWaitlist) {
      return
    }

    try {
      yield this.waitlistService.applyForWaitlist(WaitlistFeature.VirtualCard)
    } catch (err: any) {
      this.monitoring.exception(err)
      this.toast.error('Service Temporary Unavailable')
    } finally {
      this.loading = false
    }
  }
}

const NoopCardNumber = new Array<string>(16).fill('0').join('')
