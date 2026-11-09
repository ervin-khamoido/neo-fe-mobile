import React, { memo, useCallback } from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { Observer } from 'mobx-react-lite'

import ioc from '../../../ioc'

import { BottomModal } from '../../../component/modals/bottom-modal'
import { fonts } from '../../../common/typeface'
import { colors } from '../../../common/constrants'

import { Spacer, VSpacer } from '../../../component/spacer'
import { Button, OutlineButton } from '../../../component/button'

import { ModalMonitor } from '../../../widget/modal-monitor.widget'

import { LevelOneAcknowledgmentBLoC } from './level-one-ack.bloc'

export const LevelOneAcknowledgmentWidget = memo(props => {
  const bloc = ioc.useBLoC(LevelOneAcknowledgmentBLoC, props)

  const onSecondaryAction = useCallback(() => bloc.onSecondaryAction(), [bloc])
  const onConfirm = useCallback(() => bloc.onConfirm(), [bloc])

  return (
    <Observer>
      {() => (
        <>
          <BottomModal
            visible={bloc.showModal}
            swipeable
            onSwipeDown={onSecondaryAction}
            onBackdropPress={onSecondaryAction}
          >
            <Text style={styles.title}>Information Update</Text>
            <Spacer height={16} />

            <Text style={styles.body}>
              Before you proceed, we need to collect some personal information to update our records and enable us serve
              you better
            </Text>
            <Spacer height={24} />

            <View style={styles.buttons}>
              <OutlineButton
                style={styles.button}
                title={bloc.isSkippable ? 'Skip' : 'Cancel'}
                onPress={onSecondaryAction}
              />
              <VSpacer width={17} />
              <Button style={styles.button} title="Confirm" onPress={onConfirm} />
            </View>

            <Spacer height={24} />
          </BottomModal>
          <ModalMonitor
            isVisible={bloc.showModal}
            hostComponentName="Main Stack"
            modalName="Level One Acknowledgment"
          />
        </>
      )}
    </Observer>
  )
})

const styles = StyleSheet.create({
  title: {
    ...fonts.h2SemiBold,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
  },
})
