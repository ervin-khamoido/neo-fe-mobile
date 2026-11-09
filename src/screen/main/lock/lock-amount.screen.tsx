import React, { useCallback, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../../../ioc'
import { LockAmountMode, LockWithdrawalMode } from '../../../models'

import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton, UtilityButton } from '../../../component/button-v2'
import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { ILockDurationOption, LockAmountBLoC, MAX_LOCK_DAYS, MIN_LOCK_DAYS, SelectedDateTag } from './lock-amount.bloc'
import { ConfirmModal } from '../../../component/modals/confirm-modal'
import DatePicker from 'react-native-date-picker'
import { addDays } from 'date-fns'
import { formatExpirationDuration } from '../../../utils/helpers'

export const LockAmountScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const LockAmountScreen = observer(props => {
  const bloc = ioc.useBLoC(LockAmountBLoC, props)

  const onIncreaseAmount = useCallback(() => bloc.onIncreaseAmount(), [bloc])
  const onDecreaseAmount = useCallback(() => bloc.onDecreaseAmount(), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onWithdrawAll = useCallback(
    () => bloc.onShowWithdrawalConfirmationModal(LockWithdrawalMode.WITHDRAW_ALL),
    [bloc],
  )
  const onWithdrawHandler = useCallback(() => bloc.onWithdrawHandler(), [bloc])
  const onToggleFirstCheckBox = useCallback(() => bloc.onToggleFirstCheckBox(), [bloc])
  const onHideDatePicker = useCallback(() => bloc.onHideDatePicker(), [bloc])
  const onSelectCustomDateOption = useCallback(() => bloc.onSelectCustomDateOption(), [bloc])
  const onHideWithdrawalConfirmationModal = useCallback(() => bloc.onHideWithdrawalConfirmationModal(), [bloc])
  const onSelectDurationOption = useCallback(
    (value: number, tag: SelectedDateTag) => bloc.onSelectDurationOption(value, tag),
    [bloc],
  )
  const onSelectCustomDate = useCallback((value: Date) => bloc.onSelectCustomDate(value), [bloc])

  const customDateOption = useMemo(() => {
    let label = 'Custom period (min 7 days)...'

    if (bloc.selectedDateTag === SelectedDateTag.CUSTOM_DATE) {
      const currentDate = new Date()
      const selectedDate = addDays(currentDate, bloc.data.durationInDays)
      const formattedSelectedDate = formatExpirationDuration(selectedDate)

      label = formattedSelectedDate
    }

    return {
      label,
      value: 7,
      tag: SelectedDateTag.CUSTOM_DATE,
    }
  }, [bloc.data.durationInDays, bloc.selectedDateTag])

  const renderDateOptionItem = option => (
    <DateOption
      key={option.tag}
      option={option}
      selectedOptionTag={bloc.selectedDateTag}
      onSelectOption={onSelectDurationOption}
    />
  )

  const renderDatePickerSection = () => (
    <>
      <Spacer height={24} />

      <View style={styles.btnRow}>{bloc.lockDurationOptions.map(renderDateOptionItem)}</View>
      <Spacer height={16} />

      <View style={styles.horizontalPadding}>
        <DateOption
          key={SelectedDateTag.CUSTOM_DATE}
          option={customDateOption}
          selectedOptionTag={bloc.selectedDateTag}
          onSelectOption={onSelectDurationOption}
          onShowDatePicker={onSelectCustomDateOption}
        />
      </View>
    </>
  )

  return (
    <SafeAreaView style={styles.container} edges={Edges}>
      <Text style={styles.header}>{screenTitle[bloc.mode]}</Text>
      <Spacer height={8} />

      {[LockAmountMode.Create, LockAmountMode.Deposit].includes(bloc.mode) && (
        <Text style={styles.walletBalanceText}>Wallet Balance: {bloc.formattedBalance}</Text>
      )}
      <Spacer height={40} />

      <View style={styles.amountRow}>
        <Button style={styles.signBtn} title="" onPress={onDecreaseAmount} disabled={bloc.isDecreaseBtnDisabled}>
          <VectorImage style={styles.signIcon} width={24} height={24} source={MinusIconSrc} />
        </Button>
        <VSpacer width={8} />

        <Text style={styles.amount}>{bloc.formattedAmount}</Text>

        <VSpacer width={8} />
        <Button style={styles.signBtn} title="" onPress={onIncreaseAmount} disabled={bloc.isIncreaseBtnDisabled}>
          <VectorImage style={styles.signIcon} width={24} height={24} source={PlusIconSrc} />
        </Button>
      </View>
      <Spacer height={8} />

      <Text style={styles.secondaryText}>{bloc.dreamPoints} Dream Points</Text>

      {bloc.mode === LockAmountMode.Withdraw && (
        <Text style={styles.secondaryText}>Available Balance: {bloc.formattedLockBalance}</Text>
      )}

      {(!!bloc.formattedLockSelectedUntilDate || bloc.data.durationInDays > 0) && (
        <>
          <Spacer height={16} />
          <Text style={styles.untilDate}>Dream Lock expires {bloc.formattedLockSelectedUntilDate}</Text>
        </>
      )}
      <Spacer height={24} />

      {bloc.mode === LockAmountMode.Create && renderDatePickerSection()}
      <Spacer height={24} />
      <Spacer height={-1} />

      <TouchableOpacity style={styles.confirmRow} onPress={onToggleFirstCheckBox}>
        <CheckBox
          style={styles.checkbox}
          disabled
          value={bloc.isFirstCheckBoxToggled}
          onValueChange={onToggleFirstCheckBox}
          tintColors={CheckboxTintColors}
          tintColor={colors.accent}
          boxType="square"
          onFillColor={colors.accent}
          onCheckColor={colors.input}
          onTintColor={colors.accent}
          onAnimationType="fill"
          offAnimationType="fill"
        />
        <VSpacer width={12} />

        <Text style={styles.pointText}>
          I agree that if I withdraw my money before the due date, I'll be charged a fee of 2% of the total amount I
          withdraw.
        </Text>
      </TouchableOpacity>
      <Spacer height={16} />

      {bloc.mode === LockAmountMode.Withdraw && (
        <>
          <OutlineButton
            title="Withdraw All"
            loading={bloc.withdrawAllLoading}
            disabled={bloc.isCreateBtnDisabled}
            onPress={onWithdrawAll}
          />
          <Spacer height={16} />
        </>
      )}

      <Button
        title={submitBtnTitle[bloc.mode]}
        loading={bloc.loading}
        disabled={bloc.isCreateBtnDisabled}
        onPress={onSubmit}
        indicatorColor={colors.accent}
      />
      <Spacer height={24} />

      <DatePicker
        modal
        mode="date"
        open={bloc.isDatePickerVisible}
        date={addDays(new Date(), bloc.data.durationInDays)}
        minimumDate={MINIMUM_LOCK_DATE}
        maximumDate={MAXIMUM_LOCK_DATE}
        onConfirm={onSelectCustomDate}
        onCancel={onHideDatePicker}
      />

      <ConfirmModal
        title={'Early withdrawal'}
        body={`If you wish to withdraw before the Dream Lock expiration date, you will be charged a ${bloc.formattedWithdrawalAmountIncludeFees} penalty.`}
        visible={bloc.isWithdrawalConfirmationModalVisible}
        onConfirm={onWithdrawHandler}
        onCancel={onHideWithdrawalConfirmationModal}
      />
    </SafeAreaView>
  )
})

type DateOptionPropsType = {
  option: ILockDurationOption
  selectedOptionTag: SelectedDateTag
  onSelectOption: (value: number, tag: SelectedDateTag) => void
  onShowDatePicker?: () => void
}

const DateOption = observer<DateOptionPropsType>(({ option, onSelectOption, selectedOptionTag, onShowDatePicker }) => {
  const onOptionPress = useCallback(() => onSelectOption(option.value, option.tag), [option, onSelectOption])

  const onPress = useMemo(
    () => (option.tag === SelectedDateTag.CUSTOM_DATE ? onShowDatePicker : onOptionPress),
    [option, onShowDatePicker, onOptionPress],
  )

  const btnStyles = useMemo(
    () =>
      StyleSheet.flatten([
        { paddingHorizontal: 16 },
        selectedOptionTag === option.tag ? { backgroundColor: colors.accent } : {},
      ]),
    [selectedOptionTag, option.tag],
  )

  const btnTextStyles = useMemo(
    () => StyleSheet.flatten([selectedOptionTag === option.tag ? { color: colors.textLight } : {}]),
    [selectedOptionTag, option.tag],
  )

  return <UtilityButton title={option.label} onPress={onPress} style={btnStyles} textStyle={btnTextStyles} />
})

const MINIMUM_LOCK_DATE = addDays(new Date(), MIN_LOCK_DAYS)
const MAXIMUM_LOCK_DATE = addDays(new Date(), MAX_LOCK_DAYS)

const submitBtnTitle = {
  [LockAmountMode.Create]: 'Create Dream Lock',
  [LockAmountMode.Deposit]: 'Add',
  [LockAmountMode.Withdraw]: 'Withdraw',
}

const screenTitle = {
  [LockAmountMode.Create]: 'How much would you like to Lock?',
  [LockAmountMode.Deposit]: 'How much would you like to add to your Dream Lock?',
  [LockAmountMode.Withdraw]: 'How much would you like to withdraw from your Dream Lock?',
}

const MinusIconSrc = require('../../../../assets/images/minus.icon.svg')
const PlusIconSrc = require('../../../../assets/images/plus.icon.svg')

const Edges: Edge[] = ['bottom']

const CheckboxTintColors = {
  true: colors.accent,
  false: colors.accent,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRow: {
    paddingHorizontal: sizes.marginV2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalPadding: {
    paddingHorizontal: sizes.marginV2,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  untilDate: {
    textAlign: 'center',
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  amount: {
    width: '60%',
    textAlign: 'center',
    ...fonts.numbersM,
    color: colors.accent,
  },
  walletBalanceText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  secondaryText: {
    textAlign: 'center',
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textLabel,
  },
  pointText: {
    flex: 1,
    ...fonts.h4Regular,
    textAlign: 'left',
    color: colors.text,
  },
  confirmRow: {
    flexDirection: 'row',
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  signBtn: {
    flex: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  signIcon: {
    tintColor: colors.background,
    width: 24,
    height: 24,
  },
})
