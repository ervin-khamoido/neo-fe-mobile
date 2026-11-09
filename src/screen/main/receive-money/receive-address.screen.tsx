import React, { useCallback } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'

import ioc from '../../../ioc'

import { sizes } from '../../../common/constrants'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'

import { Spacer, VSpacer } from '../../../component/spacer'
import { Button } from '../../../component/button-v2'

import { StackNavigationOptions } from '@react-navigation/stack'
import QRCode from 'react-native-qrcode-svg'
import VectorImage from 'react-native-vector-image'
import { ReceiveAddressBLoC } from './receive-address.bloc'
import { CopiableTextWidget } from '../tabs/widget/copiable-text.widget'

const NeobankLogoSrc = require('../../../../assets/images/neobank-logo-v2.png')
const ShareIconSrc = require('../../../../assets/images/share-v2.icon.svg')
const QRCodeSize = 180

export const ReceiveAddressScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: 'Receive Money',
}

export const ReceiveAddressScreen = observer(props => {
  const bloc = ioc.useBLoC(ReceiveAddressBLoC, props)

  const onSharePress = useCallback(() => bloc.onShare(), [bloc])
  const onReceiveOnChainApply = useCallback(() => bloc.onReceiveOnChainApply(), [bloc])

  const renderComingSoon = () => (
    <>
      <Text style={styles.header}>Share your wallet address to receive money</Text>
      <Spacer height={40} />

      <View style={styles.qrCodeWrapper}>
        <View style={styles.qrCodeContainer}>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </View>
      </View>
      <Spacer height={-1} />

      <Button disabled title="Apply Now" />
      <Spacer height={24} />
    </>
  )

  const renderWaitlist = () => (
    <>
      <Text style={styles.header}>Want to receive money from a blockchain address?</Text>
      <Spacer height={-1} />

      <Text style={styles.marketingText}>{`Join our waiting list\nto get early access!`}</Text>
      <Spacer height={40} />
      <Spacer height={-1} />

      <Button
        disabled={bloc.loading || !bloc.canUserApply}
        title={bloc.canUserApply ? 'Get Early Access' : 'Early Access Requested'}
        onPress={onReceiveOnChainApply}
      />
      <Spacer height={24} />
    </>
  )

  const renderReceiveOnChain = () => (
    <>
      <Text style={styles.header}>Share your wallet address to receive money</Text>
      <Spacer height={40} />

      <View style={styles.qrCodeWrapper}>
        <View style={styles.qrCodeContainer}>
          {bloc.isAddressPending ? (
            <>
              <ActivityIndicator size="large" />
              <Spacer height={16} />
              <Text style={styles.pendingAddress}>Creating your crypto address</Text>
            </>
          ) : (
            <QRCode
              logo={NeobankLogoSrc}
              logoSize={48}
              logoBackgroundColor={colors.background}
              logoMargin={6}
              ecl={'M'}
              logoBorderRadius={10}
              size={QRCodeSize}
              value={bloc.incomingCryptoAddress}
            />
          )}
        </View>
      </View>
      <Spacer height={24} />

      <Button title="" style={styles.shareBtnWrapper} disabled={bloc.isAddressPending} onPress={onSharePress}>
        <VectorImage style={styles.tokenIcon} width={24} height={24} source={ShareIconSrc} />
      </Button>

      {!bloc.isAddressPending && (
        <>
          <Spacer height={16} />
          <View style={styles.infoRowWrapper}>
            <Text style={styles.infoRowLabel}>Wallet Address</Text>
            <Spacer height={8} />
            <CopiableTextWidget style={styles.infoRowValue} copyText={bloc.incomingCryptoAddress} showCopyIcon>
              {bloc.incomingCryptoAddress}
            </CopiableTextWidget>
          </View>

          <Spacer height={16} />
          <View style={styles.infoRowWrapper}>
            <Text style={styles.infoRowLabel}>Network</Text>
            <Spacer height={8} />
            <View style={styles.infoRow}>
              <VectorImage style={styles.tokenIcon} width={24} height={24} source={AvalancheNetworkIcon} />
              <VSpacer width={4} />
              <Text style={styles.infoRowValue}>Avalanche C-Chain</Text>
            </View>
          </View>

          <Spacer height={16} />
          <View style={styles.infoRowWrapper}>
            <Text style={styles.infoRowLabel}>Supported Token</Text>
            <Spacer height={8} />
            <View style={styles.infoRow}>
              <VectorImage style={styles.tokenIcon} width={24} height={24} source={USDCTokenIcon} />
              <VSpacer width={4} />
              <Text style={styles.infoRowValue}>USDC</Text>
            </View>
          </View>
        </>
      )}

      <Spacer height={-1} />
      <Spacer height={24} />
    </>
  )

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.container}>
      <Spacer height={24} />

      {!bloc.isReceiveOnChainEnabled
        ? renderComingSoon()
        : bloc.showWaitlist
        ? renderWaitlist()
        : renderReceiveOnChain()}
    </ScrollView>
  )
})

const AvalancheNetworkIcon = require('../../../../assets/images/crypto-coins/avaxc.icon.svg')
const USDCTokenIcon = require('../../../../assets/images/crypto-coins/usdc.icon.svg')

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: sizes.marginV2,
    backgroundColor: colors.background,
  },
  shareBtnWrapper: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  header: {
    ...fonts.h1SemiBold,
    color: colors.text,
  },

  amount: {
    ...fonts.numbersM,
    color: colors.accent,
    textAlign: 'center',
  },

  qrCodeWrapper: {
    padding: 40,
    alignSelf: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 20,

    backgroundColor: colors.background,
  },
  qrCodeContainer: {
    width: 145,
    height: 145,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingAddress: {
    ...fonts.h5Regular,
    textAlign: 'center',
    color: colors.text,
  },

  infoRowWrapper: {
    borderColor: colors.border,
  },
  infoRowLabel: {
    ...fonts.h3Regular,
    color: colors.textSecondary,
  },
  infoRowValue: {
    ...fonts.h3Regular,
    color: colors.text,
    flex: 1,
    paddingRight: 8,
  },
  infoRow: {
    flexDirection: 'row',
  },

  comingSoon: {
    ...fonts.h3SemiBold,
    color: colors.text,
    textAlign: 'center',
  },

  marketingText: {
    ...fonts.h3SemiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    alignSelf: 'center',
    width: '80%',
  },
  tokenIcon: {
    width: 24,
    height: 24,
  },
})
