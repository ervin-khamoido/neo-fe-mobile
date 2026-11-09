import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { Observer } from 'mobx-react-lite'

import ioc from '../../../ioc'

import { BottomModal } from '../../../component/modals/bottom-modal'

import { RewardBottomPopUpBLoC } from './reward-bottom-pop-up.bloc'
import { ModalMonitor } from '../../../widget/modal-monitor.widget'
import { RewardType } from '../../../models'
import { ReferralRewardDetailsWidget } from '../activity/widget/referral-reward-details.widget'
import { DefaultRewardDetailsWidget } from '../activity/widget/default-reward-details.widget'
import { CashbackRewardDetailsWidget } from '../activity/widget/cashback-reward-details.widget'

export const RewardBottomPopUpWidget = memo(props => {
  const bloc = ioc.useBLoC(RewardBottomPopUpBLoC, props)

  const onClose = useCallback(() => bloc.onModalClose(), [bloc])

  const renderWidget = () => {
    switch (bloc.rewardType) {
      case RewardType.Referral_Referrer:
        return <ReferralRewardDetailsWidget uids={bloc.uids} />
      case RewardType.Cashback_Buy:
        return <CashbackRewardDetailsWidget uids={bloc.uids} />
      default:
        return <DefaultRewardDetailsWidget uids={bloc.uids} />
    }
  }

  return (
    <Observer>
      {() => (
        <>
          <BottomModal
            visible={bloc.showReward}
            swipeable
            onModalHide={onClose}
            onSwipeDown={onClose}
            onBackdropPress={onClose}
          >
            {renderWidget()}
          </BottomModal>
          <ModalMonitor isVisible={bloc.showReward} hostComponentName="Main Stack" modalName="Reward" />
        </>
      )}
    </Observer>
  )
})

const styles = StyleSheet.create({})
