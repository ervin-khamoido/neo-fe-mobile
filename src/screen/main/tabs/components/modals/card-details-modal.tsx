import React, { PropsWithChildren } from 'react'
import { observer } from 'mobx-react-lite'
import { Text, View, StyleSheet } from 'react-native'
import Modal from 'react-native-modal'
import { SafeAreaView } from 'react-native-safe-area-context'
import LinearGradient from 'react-native-linear-gradient'

import { colors } from '../../../../../common/colorV2'
import { fonts } from '../../../../../common/typefaceV2'
import { sizes } from '../../../../../common/constrants'
import { ModalMutexGroup } from '../../../../../utils/modal.mutex'

import { Spacer } from '../../../../../component/spacer'
import { useModalMutex } from '../../../../../component/modals/common'
import { CopiableTextWidget } from '../../widget/copiable-text.widget'
import { CardBillingAddress } from '../../../../../models/card'

export type CardDetailsModal = PropsWithChildren<{
  cardNumber: string[]
  cardExpires: string
  cardCvv: string
  cardName: string
  billingAddress: CardBillingAddress | null

  visible: boolean
  swipeable?: boolean
  animationOutTiming?: number

  onSwipeUp?: () => void
  onBackdropPress: () => void
  onModalHide?: () => void

  modalMutexGroup?: ModalMutexGroup
}>

export const CardDetailsModal = observer<CardDetailsModal>(props => {
  const {
    onModalHide,
    modalMutexGroup,
    swipeable = false,
    animationOutTiming = 200,
    onSwipeUp,
    onBackdropPress,
    visible,
    cardName,
    cardExpires,
    cardCvv,
    cardNumber,
    billingAddress,
  } = props

  // --- Ad-Hoc usage of hooks ---
  const [visibleInternal, onHide] = useModalMutex(visible, modalMutexGroup, onModalHide)
  // -----------------------------

  const strBillingAddress = [
    billingAddress?.address1 ?? '',
    `${billingAddress?.city ?? ''} ${billingAddress?.state ?? ''}`,
    billingAddress?.countryCode,
    billingAddress?.zipCode ?? '',
  ].join('\n')

  return (
    <Modal
      style={styles.modal}
      isVisible={visibleInternal}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      animationOutTiming={animationOutTiming}
      useNativeDriver={!swipeable}
      swipeDirection={swipeable ? 'up' : undefined}
      onSwipeComplete={onSwipeUp}
      onBackdropPress={onBackdropPress}
      propagateSwipe={true}
      panResponderThreshold={20}
      hideModalContentWhileAnimating={true}
      onModalHide={onHide}
    >
      <SafeAreaView edges={Edges}>
        <Spacer height={60} />
        <LinearGradient
          style={styles.cardDetails}
          colors={Colors}
          start={GradientDirection.start}
          end={GradientDirection.end}
        >
          <View style={styles.cardDetailRow}>
            <Text style={styles.cardDetailsTitle}>Card Number</Text>
            <CopiableTextWidget
              style={styles.cardDetailsInfoText}
              containerStyle={styles.cardDetailsInfoRow}
              copyText={cardNumber.join('')}
              showCopyIcon
            >
              {cardNumber.map((x, i) => (
                <Text key={i} style={styles.cardNumber}>
                  {x + ' '}
                </Text>
              ))}
            </CopiableTextWidget>
          </View>
          <Spacer height={20} />

          <View style={styles.cardSeveralDetailsRow}>
            <View style={styles.cardDetailsInfoRowItem}>
              <Text style={styles.cardDetailsTitle}>Expiry Date</Text>
              <Text style={styles.cardDetailsInfoText}>{cardExpires}</Text>
            </View>
            <Spacer height={20} />

            <View style={styles.cardDetailsInfoRowItem}>
              <Text style={styles.cardDetailsTitle}>CVV</Text>
              <Text style={styles.cardDetailsInfoText}>{cardCvv}</Text>
            </View>
          </View>
          <Spacer height={20} />

          <View style={styles.line} />
          <Spacer height={20} />

          <View style={styles.cardDetailRow}>
            <Text style={styles.cardDetailsTitle}>Name on Card</Text>
            <CopiableTextWidget
              style={styles.cardDetailsInfoText}
              containerStyle={styles.cardDetailsInfoRow}
              copyText={cardName}
              showCopyIcon
            >
              {cardName}
            </CopiableTextWidget>
          </View>
          <Spacer height={20} />

          <View style={styles.cardDetailRow}>
            <Text style={styles.cardDetailsTitle}>Billing Address</Text>

            <CopiableTextWidget
              style={styles.billingAddressText}
              containerStyle={styles.cardDetailsInfoRow}
              copyText={strBillingAddress}
              showCopyIcon
            >
              {strBillingAddress}
            </CopiableTextWidget>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  )
})

const Edges = ['top'] as any

const Colors = ['#D7D7D7', '#FFFFFF']
const GradientDirection = {
  start: { x: 0.7, y: 0.7 },
  end: { x: 0, y: 0 },
}

const styles = StyleSheet.create({
  modal: {
    padding: 0,
    margin: 0,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    paddingHorizontal: sizes.marginV2,
    flex: 1,
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardDetails: {
    padding: 20,
    borderRadius: 20,
  },
  cardDetailRow: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardSeveralDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDetailsTitle: {
    ...fonts.h6Regular,
    color: colors.textLabel,
  },
  cardDetailsInfoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardDetailsInfoRowItem: {
    width: '35%',
    justifyContent: 'space-between',
  },
  cardDetailsInfoText: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  billingAddressText: {
    ...fonts.h2SemiBold,
    color: colors.text,
    flex: 1,
    flexWrap: 'wrap',
  },
  copyIcon: {
    tintColor: colors.text,
  },
  cardNumberRow: {
    flexDirection: 'row',
  },
  cardNumber: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  billingAddressColumn: {
    flexDirection: 'column',
  },
})
