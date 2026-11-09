import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { observer } from 'mobx-react-lite'

import ioc from '../../ioc'
import { MainNavigatorDef } from '../common'

import { MainTabs, MainTabsOptions } from './tabs'
import { PinWidget } from './widget/pin.widget'

import { InviteScreen, InviteScreenOptions } from './invite.screen'
import { PayWithBankScreen, PayWithBankScreenOptions } from './buy/pay-with-bank.screen'
import { BankTransferScreen, BankTransferScreenOptions } from './buy/bank-transfer.screen'
import { PurchaseOrderDetailsOptions, PurchaseOrderDetailsScreen } from './buy/purchase-order-details.screen'
import { AmountScreen, AmountScreenOptions } from './amount.screen'
import { MatchingDummyScreen, MatchingDummyScreenOptions } from './matching-dummy.screen'
import { TotalsScreen, TotalsScreenOptions } from './totals.screen'

import { SellWithBankScreen, SellWithBankScreenOptions } from './sell/sell-with-bank.screen'
import { PendingDetailsOptions, PendingDetailsScreen } from './activity/pending-detail.screen'
import { SavedBankAccountsOptions, SavedBankAccountsScreen } from './tabs/saved-bank-accounts.screen'
import { SellConfirmationScreen, SellConfirmationScreenOptions } from './sell/sell-confirmation.screen'
import { SellOrderStatusScreen, SellOrderStatusScreenOptions } from './sell/sell-order-status.screen'
import { PaymentNotReceivedScreen, PaymentNotReceivedScreenOptions } from './activity/payment-not-received.screen'
import { TransactionsDetailsScreen, TransactionsDetailsScreenOptions } from './activity/transactions-details.screen'
import { CancelledOrderScreen, CancelledOrderScreenOptions } from './activity/cancelled-order.screen'
import { DummyActivityDetailsScreen, DummyActivityDetailsScreenOptions } from './activity/dummy-activity-details.screen'
import { AddBankAccount2Screen, AddBankAccount2ScreenOptions } from '../bank/add-bank-account.screen'
import { BankAccountDetailsScreen, BankAccountDetailsScreenOptions } from './bank/bank-account-details.screen'
import { DeleteAccountScreen, DeleteAccountScreenOptions } from './tabs/delete-account.screen'
import { SecurityScreen, SecurityScreenOptions } from './tabs/security.screen'
import { EnableLockScreen, EnableLockScreenOptions } from './app-lock/enable-lock.screen'
import {
  RequestOneTimeActionScreen,
  RequestOneTimeActionScreenOptions,
} from './app-lock/request-one-time-action.screen'
import { ChangePINScreen, ChangePINScreenOptions } from './app-lock/change-pin.screen'

import { MainBLoC } from './main.bloc'
import { BuildInfoScreen, BuildInfoScreenOptions } from '../app-versions/build-info.screen'
import { HelpCenterScreen, HelpCenterScreenOptions } from './support/help-center.screen'
import { EmailSupportScreen, EmailSupportScreenOptions } from './support/email-support.screen'
import { InviteLinkScreen, InviteLinkScreenOptions } from './referral/invite-link.screen'
import { RewardDetailsScreen, RewardDetailsScreenOptions } from './activity/reward-details.screen'
import { RewardBottomPopUpWidget } from './widget/reward-bottom-pop-up.widget'
import { DefaultScreenOptions } from '../app-header/screen-v2.options'
import { LevelOneScreen, LevelOneScreenOptions } from './level/one'
import { LevelOneAcknowledgmentWidget } from './widget/level-one-ack.widget'
import { AccountLevelScreen, AccountLevelScreenOptions } from './account/account-level.screen'
import { LevelTwoScreen, LevelTwoScreenOptions } from './level/two'
import { SendAmountScreen, SendAmountScreenOptions } from './send-money/send-amount.screen'
import { SendRecipientScreen, SendRecipientScreenOptions } from './send-money/internal/send-recipient.screen'
import { SendResultScreen, SendResultScreenOptions } from './send-money/internal/send-result.screen'
import { UsernameScreen, UsernameScreenOptions } from './tabs/username.screen'
import { MoneyTransferDetailsScreen, MoneyTransferDetailsScreenOptions } from './activity/money-transfer-detail'
import { SendConfirmScreen, SendConfirmScreenOptions } from './send-money/internal/send-confirm.screen'
import { ActivityScreen, ActivityTabOptions } from './tabs/activity.screen'
import { ProfileScreen, ProfileScreenOptions } from './tabs/profile.screen'
import { BvnScreen, BvnScreenOptions } from './card/bvn.screen'
import { PersonalDetailsOptions, PersonalDetailsScreen } from './account/personal-details'
import { CardFundScreen, CardFundScreenOptions } from './card/card-fund.screen'
import { CardUnloadScreen, CardUnloadScreenOptions } from './card/card-unload.screen'
import { CardActivityDetailScreen, CardActivityDetailScreenOptions } from './activity/card-activity-detail.screen'
import { ContactSupportScreen, ContactSupportScreenOptions } from './support/contact-support.screen'
import { RewardsCenterOptions, RewardsCenterScreen } from './rewards/rewards-center.screen'
import { RewardTopicOptions, RewardTopicScreen } from './rewards/reward-topic.screen'
import { OnChainActivityDetailScreen, OnChainActivityDetailScreenOptions } from './activity/onchain-activity-detail'
import { FAQScreen, FAQScreenOptions } from './support/faq.screen'
import { ReceiveAddressScreen, ReceiveAddressScreenOptions } from './receive-money/receive-address.screen'
import { SendDestinationScreen, SendDestinationScreenOptions } from './send-money/send-destination.screen'
import {
  SendOnChainAddressScreen,
  SendOnChainAddressScreenOptions,
} from './send-money/on-chain/send-on-chain-address.screen'
import {
  SendOnChainConfirmScreen,
  SendOnChainConfirmScreenOptions,
} from './send-money/on-chain/send-on-chain-confirm.screen'
import { LockScreen, LockOptions } from './lock/lock.screen'
import { LockDetailsScreen, LockDetailsScreenOptions } from './lock/lock-details.screen'
import { LockAmountScreen, LockAmountScreenOptions } from './lock/lock-amount.screen'
import { LockCreateResultScreen, LockCreateResultScreenOptions } from './lock/lock-create-result.screen'
import {
  SendOnChainResultScreen,
  SendOnChainResultScreenOptions,
} from './send-money/on-chain/send-on-chain-result.screen'
import { FeatureOnboardingScreen, FeatureOnboardingScreenOptions } from './feature-onboarding.screen'
import { SasDetailsOptions, SasDetailsScreen } from './lock/sas-details.screen'
import { LotteryWinnerScreen, LotteryWinnerScreenOptions } from './lock/lottery-winner.screen'

const MainStack = createStackNavigator<MainNavigatorDef>()

export const MainNavigator = observer(props => {
  ioc.useBLoC(MainBLoC, props)

  return (
    <>
      <MainStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName={'MainTabs'}>
        <MainStack.Screen name={'MainTabs'} options={MainTabsOptions} component={MainTabs} />

        <MainStack.Screen name={'Invite'} options={InviteScreenOptions} component={InviteScreen} />
        <MainStack.Screen name={'MatchingDummy'} options={MatchingDummyScreenOptions} component={MatchingDummyScreen} />

        <MainStack.Screen name={'Amount'} options={AmountScreenOptions} component={AmountScreen} />
        <MainStack.Screen name={'Totals'} options={TotalsScreenOptions} component={TotalsScreen} />
        <MainStack.Screen name={'PayWithBank'} options={PayWithBankScreenOptions} component={PayWithBankScreen} />
        <MainStack.Screen name={'BankTransfer'} options={BankTransferScreenOptions} component={BankTransferScreen} />
        <MainStack.Screen
          name={'PurchaseOrderDetails'}
          options={PurchaseOrderDetailsOptions}
          component={PurchaseOrderDetailsScreen}
        />
        <MainStack.Screen name={'SellWithBank'} options={SellWithBankScreenOptions} component={SellWithBankScreen} />
        <MainStack.Screen name={'PendingDetails'} options={PendingDetailsOptions} component={PendingDetailsScreen} />
        <MainStack.Screen
          name={'SavedBankAccounts'}
          options={SavedBankAccountsOptions}
          component={SavedBankAccountsScreen}
        />
        <MainStack.Screen
          name={'SellConfirmation'}
          options={SellConfirmationScreenOptions}
          component={SellConfirmationScreen}
        />
        <MainStack.Screen
          name={'SellOrderStatus'}
          options={SellOrderStatusScreenOptions}
          component={SellOrderStatusScreen}
        />
        <MainStack.Screen
          name={'PaymentNotReceived'}
          options={PaymentNotReceivedScreenOptions}
          component={PaymentNotReceivedScreen}
        />
        <MainStack.Screen
          name={'TransactionsDetails'}
          options={TransactionsDetailsScreenOptions}
          component={TransactionsDetailsScreen}
        />
        <MainStack.Screen name={'RewardDetails'} options={RewardDetailsScreenOptions} component={RewardDetailsScreen} />
        <MainStack.Screen
          name={'CancelledOrder'}
          options={CancelledOrderScreenOptions}
          component={CancelledOrderScreen}
        />
        <MainStack.Screen
          name={'DummyActivityDetails'}
          options={DummyActivityDetailsScreenOptions}
          component={DummyActivityDetailsScreen}
        />
        <MainStack.Screen
          name={'MoneyTransferDetails'}
          options={MoneyTransferDetailsScreenOptions}
          component={MoneyTransferDetailsScreen}
        />
        <MainStack.Screen
          name={'CardActivityDetails'}
          options={CardActivityDetailScreenOptions}
          component={CardActivityDetailScreen}
        />
        <MainStack.Screen
          name={'OnChainActivityDetails'}
          options={OnChainActivityDetailScreenOptions}
          component={OnChainActivityDetailScreen}
        />

        <MainStack.Screen
          name={'AddBankAccount2'}
          options={AddBankAccount2ScreenOptions}
          component={AddBankAccount2Screen}
        />

        <MainStack.Screen
          name={'BankAccountDetails'}
          options={BankAccountDetailsScreenOptions}
          component={BankAccountDetailsScreen}
        />
        <MainStack.Screen name={'DeleteAccount'} options={DeleteAccountScreenOptions} component={DeleteAccountScreen} />
        <MainStack.Screen name={'Security'} options={SecurityScreenOptions} component={SecurityScreen} />

        <MainStack.Screen name={'EnableAppLock'} options={EnableLockScreenOptions} component={EnableLockScreen} />
        <MainStack.Screen name={'ChangePIN'} options={ChangePINScreenOptions} component={ChangePINScreen} />
        <MainStack.Screen
          name={'RequestOneTimeAction'}
          options={RequestOneTimeActionScreenOptions}
          component={RequestOneTimeActionScreen}
        />
        <MainStack.Screen name={'BuildInfo'} options={BuildInfoScreenOptions} component={BuildInfoScreen} />
        <MainStack.Screen name={'HelpCenter'} options={HelpCenterScreenOptions} component={HelpCenterScreen} />
        <MainStack.Screen name={'FAQ'} options={FAQScreenOptions} component={FAQScreen} />
        <MainStack.Screen name={'EmailSupport'} options={EmailSupportScreenOptions} component={EmailSupportScreen} />
        <MainStack.Screen
          name={'ContactSupport'}
          options={ContactSupportScreenOptions}
          component={ContactSupportScreen}
        />

        <MainStack.Screen name={'Username'} options={UsernameScreenOptions} component={UsernameScreen} />
        <MainStack.Screen name={'InviteLink'} options={InviteLinkScreenOptions} component={InviteLinkScreen} />

        <MainStack.Screen name={'LevelOne'} options={LevelOneScreenOptions} component={LevelOneScreen} />
        <MainStack.Screen name={'LevelTwo'} options={LevelTwoScreenOptions} component={LevelTwoScreen} />

        <MainStack.Screen name="AccountLevel" options={AccountLevelScreenOptions} component={AccountLevelScreen} />

        <MainStack.Screen
          name="SendDestination"
          options={SendDestinationScreenOptions}
          component={SendDestinationScreen}
        />

        <MainStack.Screen name="Receive" options={ReceiveAddressScreenOptions} component={ReceiveAddressScreen} />

        <MainStack.Screen name="SendAmount" options={SendAmountScreenOptions} component={SendAmountScreen} />
        <MainStack.Screen
          name="SendOnChainAddress"
          options={SendOnChainAddressScreenOptions}
          component={SendOnChainAddressScreen}
        />
        <MainStack.Screen name="SendRecipient" options={SendRecipientScreenOptions} component={SendRecipientScreen} />
        <MainStack.Screen name="SendResult" options={SendResultScreenOptions} component={SendResultScreen} />
        <MainStack.Screen name="SendConfirm" options={SendConfirmScreenOptions} component={SendConfirmScreen} />
        <MainStack.Screen
          name="SendOnChainConfirm"
          options={SendOnChainConfirmScreenOptions}
          component={SendOnChainConfirmScreen}
        />
        <MainStack.Screen
          name="SendOnChainResult"
          options={SendOnChainResultScreenOptions}
          component={SendOnChainResultScreen}
        />

        <MainStack.Screen name="Activity" options={ActivityTabOptions} component={ActivityScreen} />
        <MainStack.Screen name="Account" options={ProfileScreenOptions} component={ProfileScreen} />
        <MainStack.Screen name="PersonalDetails" options={PersonalDetailsOptions} component={PersonalDetailsScreen} />

        <MainStack.Screen name="Bvn" options={BvnScreenOptions} component={BvnScreen} />
        <MainStack.Screen name="CardFund" options={CardFundScreenOptions} component={CardFundScreen} />
        <MainStack.Screen name="CardUnload" options={CardUnloadScreenOptions} component={CardUnloadScreen} />

        <MainStack.Screen name="RewardsCenter" options={RewardsCenterOptions} component={RewardsCenterScreen} />
        <MainStack.Screen name="RewardTopic" options={RewardTopicOptions} component={RewardTopicScreen} />

        <MainStack.Screen name="Lock" options={LockOptions} component={LockScreen} />
        <MainStack.Screen name="LockDetails" options={LockDetailsScreenOptions} component={LockDetailsScreen} />
        <MainStack.Screen name="LockAmount" options={LockAmountScreenOptions} component={LockAmountScreen} />
        <MainStack.Screen
          name="LockCreateResult"
          options={LockCreateResultScreenOptions}
          component={LockCreateResultScreen}
        />
        <MainStack.Screen name="SasDetails" options={SasDetailsOptions} component={SasDetailsScreen} />

        <MainStack.Screen
          name="FeatureOnboarding"
          options={FeatureOnboardingScreenOptions}
          component={FeatureOnboardingScreen}
        />

        <MainStack.Screen name={'LotteryWinner'} options={LotteryWinnerScreenOptions} component={LotteryWinnerScreen} />
      </MainStack.Navigator>

      <PinWidget />
      <RewardBottomPopUpWidget />
      <LevelOneAcknowledgmentWidget />
    </>
  )
})
