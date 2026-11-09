import { inject, injectable } from 'inversify'
import Animated from 'react-native-reanimated'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'

import { IBLoC } from '../../ioc'
import { MainNavigatorDef } from '../common'
import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { getOnboardingPageSize } from './feature-onboarding.screen'
import { breadcrumb } from '../../utils/breadcrumb'
import { NavigationParamsSymbol } from '../../ioc/component.scope'
import { OnboardingType } from '../../models'
import { ILockService, LockServiceSymbol } from '../../services/lock.service'
import { IToastService, ToastServiceSymbol } from '../../services/toast.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { ILockStore, LockStoreSymbol } from '../../services/store/lock.store'
import { ILotteryService, LotteryServiceSymbol } from '../../services/lottery.service'
import { screenAnalytics } from '../../utils/screen-analytics'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../services/analytics/analytics.service'

type NavParams = MainNavigatorDef['FeatureOnboarding']

@screenAnalytics<unknown, NavParams>(AnalyticsFlow.Main, AnalyticsScreen.FeatureOnboarding, (props, params) => ({
  mode: params.type,
}))
@breadcrumb('Feature Onboarding')
@injectable()
export class FeatureOnboardingBLoC implements IBLoC {
  @inject(NavigationServiceSymbol) private navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) private toastService!: IToastService
  @inject(LockServiceSymbol) private lockService!: ILockService
  @inject(LotteryServiceSymbol) private lotteryService!: ILotteryService
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(LockStoreSymbol) lockStore!: ILockStore

  @inject(NavigationParamsSymbol) private navParams!: NavParams

  scrollRef!: Animated.ScrollView
  @observable currentPage = 0
  @observable loading = false

  @computed get onboardingType(): OnboardingType {
    return this.navParams.type
  }

  finishOnboarding() {
    switch (this.onboardingType) {
      case OnboardingType.PLS:
        this.analyticsService.tap(AnalyticsFlow.Main, AnalyticsScreen.FeatureOnboarding, {
          tag: 'pls_participate',
        })

        if (!this.lockStore.locks.length) {
          this.onSasDetailsPage()
          return
        }
        this.onLockPage()
        break
      default:
        break
    }
  }

  constructor() {
    makeObservable(this)

    reaction(
      () => this.currentPage,
      (curr, prev) => {
        this.analyticsService.closeScreen(AnalyticsFlow.Main, this.getOnboardingAnalyticsScreen(prev))
        this.analyticsService.openScreen(AnalyticsFlow.Main, this.getOnboardingAnalyticsScreen(curr))
      },
    )
  }

  onScreenFocus() {
    this.analyticsService.openScreen(AnalyticsFlow.Main, AnalyticsScreen.FeatureOnboarding_StepOne)
  }

  isBlurred = false
  onScreenBlur() {
    this.isBlurred = true
  }

  onDestroy() {
    if (!this.isBlurred) {
      this.analyticsService.closeScreen(AnalyticsFlow.Main, this.getOnboardingAnalyticsScreen(this.currentPage))
    }
  }

  @action onParamsChange(_, params: NavParams) {
    this.navParams = params
  }

  @action onNextPage(totalScreenAmount: number) {
    this.currentPage = Math.min(this.currentPage + 1, totalScreenAmount)
    this.scrollRef.scrollTo({ x: this.currentPage * getOnboardingPageSize() })
  }

  @action onScrollEnd(offset: number) {
    this.currentPage = Math.round(offset / getOnboardingPageSize())
  }

  @flow *onLockPage() {
    this.loading = true

    try {
      yield this.lockService.syncLocks()

      this.navigationService.replace('Lock')
      this.appConfigStore.setOnboardingSeen(OnboardingType.PLS, true)
    } catch (err) {
      this.toastService.error('Oops... Something went wrong, please try again.')
    } finally {
      this.loading = false
    }
  }
  @flow *onSasDetailsPage() {
    this.loading = true

    try {
      yield this.lotteryService.syncLottery()

      this.navigationService.replace('SasDetails')
      this.appConfigStore.setOnboardingSeen(OnboardingType.PLS, true)
    } catch (err) {
      this.toastService.error('Oops... Something went wrong, please try again.')
    } finally {
      this.loading = false
    }
  }

  private getOnboardingAnalyticsScreen(index: number) {
    switch (index) {
      case 0:
        return AnalyticsScreen.FeatureOnboarding_StepOne
      case 1:
        return AnalyticsScreen.FeatureOnboarding_StepTwo
      case 2:
        return AnalyticsScreen.FeatureOnboarding_StepThree
      case 3:
        return AnalyticsScreen.FeatureOnboarding_StepFour
      default:
        return AnalyticsScreen.FeatureOnboarding_StepFour
    }
  }
}
