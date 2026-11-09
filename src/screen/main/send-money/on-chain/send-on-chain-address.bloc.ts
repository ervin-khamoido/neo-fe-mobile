import { inject, injectable } from 'inversify'
import { action, computed, flow, makeObservable, observable } from 'mobx'
import currency from 'currency.js'
import { ConnectionError, RequestError } from '@ts-awesome/request'

import { IBLoC } from '../../../../ioc'
import { MainNavigatorDef } from '../../../common'
import { CurrencyCode, StatusCode } from '../../../../common/constrants'
import { breadcrumb } from '../../../../utils/breadcrumb'
import { formatCurrency } from '../../../../lib/utils/helpers'
import { InitialPropsSymbol, NavigationParamsSymbol } from '../../../../ioc/component.scope'
import {
  INetworkOption,
  ITokenOption,
  CryptoNetwork,
  CryptoToken,
  VerifyCryptoAddressOutput,
  OnChainToken,
} from '../../../../models'

import { INavigationService, NavigationServiceSymbol } from '../../../../services/navigation.service'
import { IToastService, ToastServiceSymbol } from '../../../../services/toast.service'
import { IOnChainService, OnChainServiceSymbol } from '../../../../services/on-chain.service'

import { FinanceStoreSymbol, IFinanceStore } from '../../../../services/store/finance.store'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../../services/monitoring.service'

import { UsernameWidgetProps } from '../../../auth/sign-up-details/widget/username.widget'
import { DeviceStoreSymbol, IDeviceStore } from '../../../../services/store/device.store'
import { screenAnalytics } from '../../../../utils/screen-analytics'
import { AnalyticsFlow, AnalyticsScreen } from '../../../../services/analytics/analytics.service'
import { IUserStore, UserStoreSymbol } from '../../../../services/store/user.store'

export enum TabValues {
  WalletAddress = 'wallet_address',
  QRCode = 'qr_code',
}

interface ITabOption {
  label: string
  value: TabValues
  disabled?: boolean
}

type NavParams = MainNavigatorDef['SendOnChainAddress']

@screenAnalytics(AnalyticsFlow.Send, AnalyticsScreen.Send_Address)
@breadcrumb('Send OnChain Address')
@injectable()
export class SendOnChainAddressBLoC implements IBLoC {
  @inject(InitialPropsSymbol) @observable props!: UsernameWidgetProps

  @inject(NavigationServiceSymbol) navigationService!: INavigationService<MainNavigatorDef>
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(OnChainServiceSymbol) onChainService!: IOnChainService
  @inject(AppMonitoringServiceSymbol) monitoringService!: IMonitoringService

  @inject(FinanceStoreSymbol) financeStore!: IFinanceStore
  @inject(UserStoreSymbol) userStore!: IUserStore
  @inject(DeviceStoreSymbol) deviceStore!: IDeviceStore
  @inject(NavigationParamsSymbol) @observable navParams!: NavParams

  @observable loading = false
  @observable showPinModal = false

  @observable error: string | null = null

  @observable data = {
    address: '',
    token: null,
    network: null,
    selectedTab: TabValues.WalletAddress,
  }

  readonly tabOptions: ITabOption[] = [
    { label: 'Wallet Address', value: TabValues.WalletAddress },
    { label: 'QR-Code', value: TabValues.QRCode, disabled: true },
  ]

  // TODO: get tokenOptions & networkOptions from server
  readonly tokenOptions: ITokenOption[] = [
    {
      icon: require('../../../../../assets/images/crypto-coins/usdc.icon.svg'),
      label: 'USDC',
      value: CryptoToken.USDC,
    },
  ]

  readonly networkOptions: INetworkOption[] = [
    {
      icon: require('../../../../../assets/images/crypto-coins/avaxc.icon.svg'),
      label: 'Avalanche C-Chain',
      value: CryptoNetwork.AvalancheCChain,
    },
  ]

  @computed get ciEnv() {
    return this.deviceStore.buildInfo.CI_ENV
  }

  constructor() {
    makeObservable(this)
  }

  @computed get walletAddressValue(): string | null {
    return this.data.address
  }

  @computed get tokenSelectedValue() {
    return this.data.token
  }

  @computed get networkSelectedValue() {
    return this.data.network
  }

  @computed get exchangeRate() {
    const { sellExchangeRate } = this.financeStore

    return sellExchangeRate
  }

  @computed get displayAmount() {
    return formatCurrency(this.amount)
  }

  @computed get displayConvertedAmount() {
    const convertedAmount = currency(this.amount).multiply(this.exchangeRate)

    return formatCurrency(convertedAmount.value, CurrencyCode.NGN, false)
  }

  @computed get amount() {
    return this.navParams.amountUsdc
  }

  @computed get isSendDisabled() {
    const minAmount = 0.01 // one penny

    return (
      this.amount < minAmount ||
      this.loading ||
      !this.walletAddressValue ||
      !this.tokenSelectedValue ||
      !this.networkSelectedValue
    )
  }

  @computed get isAppLockEnabled() {
    return !!this.userStore.settings?.enableAppLock
  }

  onParamsChange() {
    // nothing to do here
  }

  @action onPinModalConfirm() {
    this.showPinModal = false
    this.navigationService.navigate('EnableAppLock')
  }

  @action onPinModalCancel() {
    this.showPinModal = false
  }

  @action onChange(name: string, value: string) {
    if (name === 'address') {
      this.error = null
    }

    this.data[name] = value
  }

  @action onEdit() {
    this.navigationService.back()
  }

  @flow *onNext() {
    this.loading = true

    if (!this.isAppLockEnabled) {
      this.showPinModal = true
      this.loading = false
      return
    }

    try {
      const {
        address,
        token: { value: tokenValue },
        network: { value: networkValue },
      } = this.data

      const result: VerifyCryptoAddressOutput = yield this.onChainService.verifyCryptoAddress({
        address: address,
        baseCoin: this.getBaseCoin(networkValue),
        coin: this.getCoin(networkValue, tokenValue),
      })

      if (!result.isAddressValid) {
        this.error = result.addressValidationError
        this.toastService.error('Address is not valid')
      } else if (result.addressBelongsToNeobank) {
        this.toastService.error(
          'The address belongs to a Neobank user. Please make a send directly to the user and save the fees.',
        )
      } else {
        yield this.onChainService.calculateCurrentOnChainOrder({
          amountUsdc: this.amount,
          toAddress: address,
          baseCoin: this.getBaseCoin(networkValue),
          coin: this.getCoin(networkValue, tokenValue),
        })

        this.navigationService.navigate('SendOnChainConfirm')
      }
    } catch (err) {
      if (err instanceof ConnectionError) {
        this.toastService.error('Service Temporary Unavailable')
      } else if (err instanceof RequestError && err.statusCode === StatusCode.ServerError) {
        this.toastService.error('Service Temporary Unavailable')
      } else if (err instanceof RequestError && err.statusCode === StatusCode.BadRequest) {
        this.error = `${err.message}`
      } else {
        this.monitoringService.exception(err)
        this.toastService.error('Oops, something went wrong. Please, try again', 5000)
      }
    } finally {
      this.loading = false
    }
  }

  private getBaseCoin(network: string): string {
    switch (network) {
      case CryptoNetwork.AvalancheCChain:
        if (`${this.ciEnv}`.startsWith('prd')) {
          return OnChainToken.AVAXC
        } else {
          return OnChainToken.TAVAXC
        }
      default:
        return ''
    }
  }

  private getCoin(network: string, token: string): string {
    const baseCoin = this.getBaseCoin(network)

    switch (baseCoin) {
      case OnChainToken.TAVAXC:
        switch (token) {
          case CryptoToken.USDC:
            return OnChainToken.TAVAXC_LINK
          default:
            return ''
        }
      case OnChainToken.AVAXC:
        switch (token) {
          case CryptoToken.USDC:
            return OnChainToken.AVAXC_USDC
          default:
            return ''
        }
    }

    return `${baseCoin}:${token}`
  }
}
