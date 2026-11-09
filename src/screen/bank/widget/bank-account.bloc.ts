import React from 'react'
import { TextInput } from 'react-native'
import { inject, injectable, named } from 'inversify'
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx'
import * as yup from 'yup'

import { IBLoC } from '../../../ioc'
import { BankAccountWidgetMode } from '../../common'
import { FormErrors, FormFieldName, isValidForm, setFormValue, validateForm } from '../../../lib/utils/form'
import { BankAccountInput } from '../../../models'
import {
  ReasonCode,
  ValidateBankAccountOutput,
  ValidationStatus,
} from '../../../models/output/validate-bank-account.output'
import { InitialPropsSymbol } from '../../../ioc/component.scope'
import { NO_MATCH_ANIMATION_OUT } from '../components/no-match.modal'

import { AuthContextSymbol } from '../../../services/context/auth'
import { IAuthContext } from '../../../services/context/auth/interfaces'

import { IUserService, UserServiceSymbol } from '../../../services/user.service'
import { IToastService, ToastServiceSymbol } from '../../../services/toast.service'
import { AppMonitoringServiceSymbol, IMonitoringService } from '../../../services/monitoring.service'
import {
  CampaignTrackingServiceSymbol,
  ICampaignTrackingService,
} from '../../../services/analytics/campaign-analytics.service'

import { IUserStore, UserStoreSymbol } from '../../../services/store/user.store'

import { BankAccountWidgetProps } from './bank-account.widget'
import { Bank, EventTypes, TapEventProps } from '../../../models'
import LottieView from 'lottie-react-native'

@injectable()
export class BankAccountBLoC implements IBLoC<BankAccountWidgetProps> {
  @inject(AppMonitoringServiceSymbol) @named('BankAccountBLoC') monitoring!: IMonitoringService
  @inject(ToastServiceSymbol) toastService!: IToastService
  @inject(AuthContextSymbol) authContext!: IAuthContext

  @inject(UserServiceSymbol) userService!: IUserService
  @inject(UserStoreSymbol) userStore!: IUserStore

  @inject(CampaignTrackingServiceSymbol) campaignTrackingService!: ICampaignTrackingService

  @inject(InitialPropsSymbol) @observable props!: BankAccountWidgetProps

  @observable createdUid: string | null = null

  @computed get mode() {
    return this.props.mode
  }

  @computed get fullName() {
    return this.userStore.me?.userDetails?.fullName
  }

  @computed get fullNameExists() {
    return !!this.fullName
  }

  @computed get disclaimerText() {
    const mode = this.props.mode
    switch (mode) {
      case BankAccountWidgetMode.Buy:
      case BankAccountWidgetMode.Sell:
        if (this.fullNameExists) {
          return 'Please use your personal bank account for this transfer. The name on your bank account must be the same as your Neobank account for this transaction to be successful.'
        } else {
          return 'Please use your personal bank account for this transfer. We will use the full name of the bank account you add as the full name of your Neobank account. You will not be able to change this later.'
        }
      case BankAccountWidgetMode.SavedAccounts:
      case BankAccountWidgetMode.LevelOne:
        if (this.fullNameExists) {
          return 'Please ensure that the account you are adding is your personal bank account. The name on your bank account must be the same as your Neobank account.'
        } else {
          return 'Please ensure that the account you are adding is your personal bank account. We will use the full name of the bank account you add as the full name of your Neobank account. You will not be able to change this later.'
        }
      default:
        this.monitoring.exception(`AddBankAccountMode ${mode} is not supported`)
        return ''
    }
  }

  @computed get showGeneralHeader() {
    return [
      BankAccountWidgetMode.SavedAccounts,
      BankAccountWidgetMode.Buy,
      BankAccountWidgetMode.Sell,
      BankAccountWidgetMode.LevelOne,
    ].includes(this.mode)
  }

  @computed get showAuthHeader() {
    return [BankAccountWidgetMode.Auth].includes(this.mode)
  }

  @computed get showSkipButton() {
    return [BankAccountWidgetMode.Auth].includes(this.mode)
  }

  @computed get submitBtnTitle() {
    return this.props.ctaBtnTitle
  }

  @observable data: BankAccountInput = {
    bank: '',
    bankAccountNumber: '',
  }
  @observable formError: string | null = null
  @observable error: FormErrors<BankAccountInput> = {}
  @observable touched = false
  @observable loading = false

  @computed get banks() {
    return this.userStore.banks
  }

  @computed get selectedBanks() {
    return this.userStore.banks.filter(x => x.uid === this.data.bank)
  }

  @observable validationResult: ValidateBankAccountOutput | null = null

  @observable showConfirmationModal = false
  @observable showNoMatchModal = false
  @observable showRegisterNameModal: boolean = false
  @observable showNotEditableNameModal: boolean = false

  accountNumberRef = React.createRef<TextInput>()
  lottieViewRef = React.createRef<LottieView>()

  constructor() {
    makeObservable(this)

    reaction(
      () => [this.touched, this.data],
      () => this.validate(),
    )
  }

  @action onParamsChange(props: BankAccountWidgetProps) {
    this.props = props
  }

  @action validate() {
    if (this.touched) {
      this.error = validateForm(BankAccountSchema, this.data)
    }
  }

  @action onChange<T>(name: FormFieldName, value: T) {
    setFormValue(this, { name: 'data', field: name }, value)
  }

  @action onSelectBank(bank: Bank) {
    this.data.bank = bank.uid
  }

  @action onNoMatchCancel() {
    this.showNoMatchModal = false
    this.props.onCancel()
  }

  @action onNoMatchEdit() {
    this.showNoMatchModal = false

    // while modal is hiding the keyboard won't be triggered
    setTimeout(() => this.accountNumberRef.current.focus(), NO_MATCH_ANIMATION_OUT + 100)
  }

  @action onConfirmationBack() {
    this.showConfirmationModal = false
    this.showRegisterNameModal = false
    this.showNotEditableNameModal = false

    this.validationResult = null
  }

  @action onAnimationFinished() {
    this.props.onSubmit(this.createdUid!)
    this.loading = false
  }

  @action onToggleRegisterName() {
    this.showRegisterNameModal = !this.showRegisterNameModal
  }

  @action onToggleNotEditableName() {
    this.showNotEditableNameModal = !this.showNotEditableNameModal
  }

  @flow *onConfirmationConfirm() {
    this.touched = true
    this.loading = true

    const isValid = yield isValidForm(BankAccountSchema, this.data)
    if (!isValid) {
      this.loading = false
      return
    }

    this.data.userName = this.validationResult.fullName

    try {
      this.showConfirmationModal = false
      yield this.finalizeAddBankAccount()
    } catch (err) {
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.loading = false
    }
  }

  @flow *onSubmit() {
    this.touched = true
    this.loading = true
    this.formError = ''

    const isValid = yield isValidForm(BankAccountSchema, this.data)
    if (!isValid) {
      this.loading = false
      return
    }

    try {
      const validation: ValidateBankAccountOutput = yield this.userService.validateUserAccount(this.data)

      switch (validation.status) {
        case ValidationStatus.Valid: {
          yield this.finalizeAddBankAccount()

          break
        }
        case ValidationStatus.RequireConfirmation: {
          // confirm
          this.validationResult = validation
          this.showConfirmationModal = true

          break
        }
        case ValidationStatus.Invalid: {
          if (validation.reasonCode === ReasonCode.NoMatch) {
            this.showNoMatchModal = true
            this.error.bankAccountNumber = validation.reason
          } else {
            this.formError = validation.reason
          }

          break
        }
      }
    } catch (err) {
      this.toastService.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      this.loading = false
    }
  }

  @flow private *finalizeAddBankAccount() {
    const uid = yield this.userService.addBankAccount(this.data)
    yield this.userService.syncBankAccounts()

    if (!this.userStore.me.userDetails?.fullName) {
      yield this.userService.syncMe()
    }

    // Show animation when we are 100% sure that everything is okay
    this.lottieViewRef.current.play()
    this.createdUid = uid
  }
}

const BankAccountSchema = yup.object().shape({
  bank: yup.string().required().uuid('Please select a bank').label('Bank name'),
  bankAccountNumber: yup.string().required('Please enter a valid bank account number').label('Bank account number'),
})
