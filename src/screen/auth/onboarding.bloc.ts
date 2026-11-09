import { inject, injectable } from 'inversify'
import { action, computed, makeObservable, observable, reaction } from 'mobx'
import { Animated, ScrollView } from 'react-native'

import { IBLoC } from '../../ioc'
import { AuthNavigatorDef } from '../common'

import { INavigationService, NavigationServiceSymbol } from '../../services/navigation.service'
import { AppConfigStoreSymbol, IAppConfigStore } from '../../services/store/app-config.store'
import { AuthStoreSymbol, IAuthStore } from '../../services/store/auth.store'

import { getOnboardingPageSize, OnboardingPages } from './onboarding.screen'
import { AuthContextSymbol } from '../../services/context/auth'
import { IAuthContext } from '../../services/context/auth/interfaces'
import { breadcrumb } from '../../utils/breadcrumb'
import {
  AnalyticsFlow,
  AnalyticsScreen,
  AnalyticsServiceSymbol,
  IAnalyticsService,
} from '../../services/analytics/analytics.service'
import { screenAnalytics } from '../../utils/screen-analytics'

@screenAnalytics(AnalyticsFlow.Auth, AnalyticsScreen.Onboarding)
@breadcrumb('Onboarding')
@injectable()
export class OnboardingBLoC implements IBLoC {
  @inject(AuthStoreSymbol) authStore!: IAuthStore
  @inject(AppConfigStoreSymbol) appConfigStore!: IAppConfigStore
  @inject(NavigationServiceSymbol) navigationService!: INavigationService<AuthNavigatorDef>
  @inject(AnalyticsServiceSymbol) analyticsService!: IAnalyticsService

  @inject(AuthContextSymbol) authContext!: IAuthContext

  scrollRef!: ScrollView
  @observable currentPage = 0

  @computed get finished() {
    return this.currentPage === OnboardingPages.length - 1
  }

  finishOnboarding() {
    this.authContext.finishOnboarding()
  }

  constructor() {
    makeObservable(this)

    reaction(
      () => this.currentPage,
      (curr, prev) => {
        this.analyticsService.closeScreen(AnalyticsFlow.Auth, this.getOnboardingAnalyticsScreen(prev))
        this.analyticsService.openScreen(AnalyticsFlow.Auth, this.getOnboardingAnalyticsScreen(curr))
      },
    )
  }

  onScreenFocus() {
    this.analyticsService.openScreen(AnalyticsFlow.Auth, AnalyticsScreen.OnboardingStepOne)
  }

  isBlurred = false
  onScreenBlur() {
    this.isBlurred = true
  }

  onDestroy() {
    if (!this.isBlurred) {
      this.analyticsService.closeScreen(AnalyticsFlow.Auth, this.getOnboardingAnalyticsScreen(this.currentPage))
    }
  }

  @action onNextPage() {
    this.currentPage = Math.min(this.currentPage + 1, OnboardingPages.length - 1)

    this.scrollRef.scrollTo({ x: this.currentPage * getOnboardingPageSize() })
  }

  @action onScrollEnd(offset: number) {
    this.currentPage = Math.round(offset / getOnboardingPageSize())
  }

  onParamsChange() {
    // nothing to do here
  }

  private getOnboardingAnalyticsScreen(index: number) {
    switch (index) {
      case 0:
        return AnalyticsScreen.OnboardingStepOne
      case 1:
        return AnalyticsScreen.OnboardingStepTwo
      case 2:
        return AnalyticsScreen.OnboardingStepThree
      case 3:
        return AnalyticsScreen.OnboardingStepFour
      default:
        return AnalyticsScreen.OnboardingStepFour
    }
  }
}
