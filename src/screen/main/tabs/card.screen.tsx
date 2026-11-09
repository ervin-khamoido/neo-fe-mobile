import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { SafeAreaView } from 'react-native-safe-area-context'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../component/spacer'
import { ActivityItem } from './components/activity-item'
import { Button, OutlineButton, UtilityButton } from '../../../component/button-v2'
import { Button as ButtonV1 } from '../../../component/button'

import { CardBLoC } from './card.bloc'
import { VirtualCard } from './components/virtual-card'
import { CardBrand, VCFailureStatuses, VCPendingStatuses, VirtualCardStatus } from '../../../models'
import { ConfirmModal } from '../../../component/modals/confirm-modal'
import { TermsAndConditionsModal } from './components/modals/terms-and-conditions-modal'

const TabIconSrc = require('../../../../assets/images/credit-card.icon.svg')

export const CardTabOptions: BottomTabNavigationOptions = {
  tabBarIcon: ({ color }) => <VectorImage style={{ tintColor: color }} width={24} height={24} source={TabIconSrc} />,
  tabBarLabel: 'Card',
  headerShown: false,
}

export const CardScreen = observer(props => {
  const bloc = ioc.useBLoC(CardBLoC, props)

  const onCashOut = useCallback(() => bloc.onCashOut(), [bloc])
  const onAddCash = useCallback(() => bloc.onAddCash(), [bloc])
  const onDetailPress = useCallback(item => bloc.onDetailPress(item), [bloc])
  const onIssueCard = useCallback(() => bloc.onIssueCard(), [bloc])

  const onFreeze = useCallback(() => bloc.onFreeze(), [bloc])
  const onUnfreeze = useCallback(() => bloc.onUnfreeze(), [bloc])
  const showFreezeCardConfirmModal = useCallback(() => bloc.showFreezeCardConfirmModal(), [bloc])
  const hideFreezeCardConfirmModal = useCallback(() => bloc.hideFreezeCardConfirmModal(), [bloc])

  const onIssueCardAlertModalConfirm = useCallback(() => bloc.onIssueCardAlertModalConfirm(), [bloc])
  const onIssueCardAlertModalCancel = useCallback(() => bloc.onIssueCardAlertModalCancel(), [bloc])
  const onCustomerSupport = useCallback(() => bloc.onCustomerSupport(), [bloc])

  const onTermsAndConditionsConfirm = useCallback(() => bloc.onTermsAndConditionsConfirm(), [bloc])
  const onTermsAndConditionsCancel = useCallback(() => bloc.onTermsAndConditionsCancel(), [bloc])
  const onTermsAndConditions = useCallback(() => bloc.onTermsAndConditions(), [bloc])

  const renderActivityBlock = () => (
    <>
      <View style={styles.activityTableHeadersRow}>
        <Text style={styles.activityTableTitle}>Transactions</Text>
      </View>
      <Spacer height={8} />

      <View style={styles.line} />
      <Spacer height={8} />

      {bloc.activity.map(x => (
        <ActivityItem key={x.uid} item={x} onPress={onDetailPress} />
      ))}
    </>
  )

  const renderCardIssued = () => (
    <>
      <View style={styles.transactionBtnRow}>
        <UtilityButton style={styles.transactionBtn} title="Top Up" loading={bloc.addCashLoading} onPress={onAddCash} />

        {/* Mastercard doesn't support the "unload" action */}
        {bloc.virtualCardBrand !== CardBrand.Mastercard && (
          <>
            <VSpacer width={8} />
            <UtilityButton
              style={styles.transactionBtn}
              title="Withdraw"
              loading={bloc.cashOutLoading}
              onPress={onCashOut}
            />
          </>
        )}

        <VSpacer width={8} />
        <UtilityButton
          style={styles.transactionBtn}
          title="Freeze"
          loading={bloc.freezeLoading}
          disabled={bloc.freezeLoading}
          onPress={showFreezeCardConfirmModal}
        />
      </View>
      <Spacer height={30} />

      <Text style={styles.delayBalanceUpdate}>
        Balances may take up to 24 hours to update after an online purchase.
      </Text>

      <Spacer height={20} />

      {renderActivityBlock()}

      <ConfirmModal
        visible={bloc.isFreezeCardConfirmModalVisible}
        title="Are you sure you want to freeze your card?"
        onConfirm={onFreeze}
        onCancel={hideFreezeCardConfirmModal}
        confirmButtonText="Yes"
        cancelButtonText="No"
      />
    </>
  )

  const renderCardComingSoon = () => (
    <>
      <Spacer height={40} />
      <Text style={styles.specialHeader}>Cards are coming soon</Text>
      <Spacer height={8} />
      <Text style={styles.specialBody}>Stay tuned for virtual debit cards</Text>
      <Spacer height={-1} />

      <Button style={styles.applyBtn} disabled title="Apply Now" />
      <Spacer height={24} />
    </>
  )

  const renderCardFrozen = () => (
    <>
      <View style={styles.transactionBtnRow}>
        <UtilityButton
          style={styles.transactionBtn}
          title="Unfreeze"
          loading={bloc.unfreezeLoading}
          disabled={bloc.unfreezeLoading}
          onPress={onUnfreeze}
        />
      </View>
      <Spacer height={40} />

      {renderActivityBlock()}
    </>
  )

  const renderCardNotIssued = () => (
    <>
      <Spacer height={40} />

      <Text style={styles.specialHeader}>{bloc.cardIssueInfo.title}</Text>
      <Spacer height={40} />

      <Text style={styles.sectionTitle}>Other Fees</Text>
      <View style={styles.sectionLine} />
      <Spacer height={10} />

      {bloc.cardIssueInfo.fees.map(x => (
        <View key={x.label} style={styles.costRow}>
          <Text style={styles.costLabel}>{x.label}</Text>
          <Text style={styles.costValue}>{x.valueFormatted}</Text>
        </View>
      ))}
      <Spacer height={-1} />

      <ButtonV1
        style={styles.applyBtn}
        textStyle={styles.applyBtnTxt}
        loading={bloc.loading}
        disabled={bloc.loading || !bloc.canUserApply}
        title={bloc.isWaitlistRequired ? 'Get Early Access' : 'Apply Now'}
        onPress={onIssueCard}
      />
      <Spacer height={24} />

      <ConfirmModal
        title={'Your balance is too low to issue a card'}
        body={`You need to top up your balance with ${bloc.displayMinBalanceRequired} or more to be able to order the card`}
        visible={bloc.showBalanceAlertModal}
        onConfirm={onIssueCardAlertModalConfirm}
        onCancel={onIssueCardAlertModalCancel}
        confirmButtonText="Top up"
      />

      <TermsAndConditionsModal
        visible={bloc.showTermsAndConditions}
        onTermsAndConditions={onTermsAndConditions}
        onConfirm={onTermsAndConditionsConfirm}
        onCancel={onTermsAndConditionsCancel}
      />
    </>
  )

  const renderCardPending = () => <></>

  const renderCardFailure = () => (
    <>
      <Spacer height={-1} />

      <OutlineButton
        loading={bloc.customerSupportLoading}
        disabled={bloc.customerSupportLoading}
        title="Contact Support"
        onPress={onCustomerSupport}
      />
      <Spacer height={24} />
    </>
  )

  return (
    <>
      <ScrollView style={styles.list} contentContainerStyle={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={Edges}>
          <Spacer height={60} />

          <VirtualCard
            status={bloc.virtualCardStatus}
            balance={bloc.displayBalance}
            cardNumber={bloc.displayCardNumber}
            cardNumberObscured={bloc.displayCardNumberObscured}
            cardExpires={bloc.displayCardExpires}
            cardCvv={bloc.displayCvv}
            cardName={bloc.displayCardName}
            billingAddress={bloc.billingAddress}
            brand={bloc.virtualCardBrand}
          />

          <Spacer height={24} />

          {bloc.virtualCardStatus === VirtualCardStatus.ComingSoon && renderCardComingSoon()}
          {bloc.virtualCardStatus === VirtualCardStatus.Card_Issued && renderCardIssued()}
          {bloc.virtualCardStatus === VirtualCardStatus.NotIssued && renderCardNotIssued()}
          {bloc.virtualCardStatus === VirtualCardStatus.Frozen && renderCardFrozen()}
          {VCFailureStatuses.includes(bloc.virtualCardStatus) && renderCardFailure()}
          {VCPendingStatuses.includes(bloc.virtualCardStatus) && renderCardPending()}
        </SafeAreaView>
      </ScrollView>
    </>
  )
})

const Edges = ['top'] as any

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
    flexGrow: 1,
  },
  safeArea: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  transactionBtnRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activityTableHeadersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionBtn: {
    flex: 1,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityTableBtn: {
    ...fonts.h6PreSemiBold,
    color: colors.text,
  },
  activityTableTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  specialHeader: {
    ...fonts.h1SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  specialBody: {
    ...fonts.h4Regular,
    color: colors.text,
    textAlign: 'center',
  },

  sectionTitle: {
    ...fonts.h6Regular,
    color: colors.text,
  },
  sectionLine: {
    marginTop: 8,
    backgroundColor: colors.border2,
    height: 1,
  },
  costRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    marginVertical: 10,
  },
  costLabel: {
    ...fonts.h4Regular,
    color: colors.text,
    flex: 1,
  },
  costValue: {
    ...fonts.h4PreSemiBold,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
  },
  applyBtn: {
    // backgroundColor: colors.accent,
    // borderColor: colors.accent,
  },
  applyBtnTxt: {
    ...fonts.h3Regular,
  },
  delayBalanceUpdate: {
    ...fonts.h5Regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
