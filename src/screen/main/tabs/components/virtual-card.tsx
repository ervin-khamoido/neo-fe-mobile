import React, { useCallback, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import VectorImage from 'react-native-vector-image'

import { colors } from '../../../../common/colorV2'
import { Spacer } from '../../../../component/spacer'
import { fonts } from '../../../../common/typefaceV2'
import {
  CardBillingAddress,
  CardBrand,
  VCFailureStatuses,
  VCPendingStatuses,
  VirtualCardStatus,
} from '../../../../models'
import { CardDetailsModal } from './modals/card-details-modal'

interface IVirtualCardProps {
  status: VirtualCardStatus
  balance: string
  brand: CardBrand

  cardNumber: string[]
  cardNumberObscured: string[]
  cardExpires: string | null
  cardCvv: string | null
  cardName: string | null
  billingAddress: CardBillingAddress | null
}

export const VirtualCard = observer<IVirtualCardProps>(
  ({ status, balance, brand, cardNumber, cardNumberObscured, cardExpires, cardCvv, cardName, billingAddress }) => {
    const [modalVisible, setModalVisible] = useState(false)

    const isVertical = [VirtualCardStatus.ComingSoon].includes(status)
    const showBalance = [VirtualCardStatus.Card_Issued].includes(status)

    const showModal = useCallback(() => status === VirtualCardStatus.Card_Issued && setModalVisible(true), [status])
    const hideModal = useCallback(() => setModalVisible(false), [])

    const containerStyle = useMemo(() => [styles.card, isVertical ? styles.cardVertical : {}], [isVertical])

    const renderFrontSide = () => (
      <Pressable style={styles.cardWrapper} onPress={showModal}>
        <LinearGradient
          style={containerStyle}
          colors={Colors}
          start={GradientDirection.start}
          end={GradientDirection.end}
        >
          {showBalance && (
            <>
              <Text style={styles.aboveBalanceTitle}>Spend Power</Text>
              <Text style={styles.cardBalance}>{balance}</Text>
            </>
          )}

          {status === VirtualCardStatus.NotIssued && (
            <>
              <Text style={styles.aboveBalanceTitle}>Welcome to</Text>
              <Text style={styles.cardBalance}>Your Virtual Card</Text>
            </>
          )}

          {VCPendingStatuses.includes(status) && <Text style={styles.cardBalance}>Please wait...</Text>}
          {VCFailureStatuses.includes(status) && <Text style={styles.cardBalance}>Something went wrong</Text>}
          {VirtualCardStatus.Frozen === status && <Text style={styles.cardBalance}>Card is frozen</Text>}

          <Spacer height={-1} />

          <View style={styles.cardRow}>
            <Text style={styles.expires}>{cardExpires ? `Expires: ${cardExpires}` : ''}</Text>
            <View style={styles.cardNumberWrapper}>
              {cardNumberObscured.map((x, i) => (
                <Text key={i} style={styles.cardNumber}>
                  {x}
                </Text>
              ))}
            </View>
          </View>

          <Spacer height={8} />

          <View style={styles.cardRow}>
            <VectorImage style={styles.neobankIcon} width={66} height={18} source={NeobankWhiteWordLogoIconSrc} />
            {brand === CardBrand.Mastercard && <VectorImage width={43} height={36} source={MastercardIconSrc} />}
            {brand === CardBrand.Visa && <Image style={styles.visaIcon} source={VisaIconSrc} resizeMode="contain" />}
          </View>
        </LinearGradient>
      </Pressable>
    )

    return (
      <>
        {renderFrontSide()}

        <CardDetailsModal
          visible={modalVisible}
          onBackdropPress={hideModal}
          onSwipeUp={hideModal}
          swipeable={true}
          cardExpires={cardExpires}
          cardCvv={cardCvv}
          cardName={cardName}
          cardNumber={cardNumber}
          billingAddress={billingAddress}
        />
      </>
    )
  },
)

const VisaIconSrc = require('../../../../../assets/images/visa.icon.png')
const MastercardIconSrc = require('../../../../../assets/images/mastercard.icon.svg')
const NeobankWhiteWordLogoIconSrc = require('../../../../../assets/images/neobank-white-word-logo-v2.icon.svg')

const Colors = ['#00000000', '#404040FF']
const GradientDirection = {
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 },
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  flipContainer: {
    flexGrow: 0,
  },
  cardWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 20,
  },
  card: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 20,

    elevation: 4,
    aspectRatio: 1.595,
  },
  cardVertical: {
    aspectRatio: 0.627,
    width: '65%',
    alignSelf: 'center',
  },
  aboveBalanceTitle: {
    ...fonts.h6Regular,
    color: colors.textLight,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardBalance: {
    ...fonts.numbersXS,
    color: colors.textLight,
  },
  cardNumberWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cardNumber: {
    ...fonts.h6Regular,
    lineHeight: 24,
    color: colors.textLight,
    marginLeft: 8,
  },

  cardNumberBackWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cardLarge: {
    ...fonts.h1Regular,
    color: colors.textLight,
    marginLeft: 8,
    textAlign: 'center',
  },
  expires: {
    ...fonts.h6Regular,
    lineHeight: 24,
    color: colors.textLight,
  },
  cvvCode: {
    ...fonts.h4Regular,
    color: colors.textLight,
  },
  visaIcon: {
    width: 57,
    height: 18,
  },
  neobankIcon: {
    width: 66,
    height: 18,
  },
})
