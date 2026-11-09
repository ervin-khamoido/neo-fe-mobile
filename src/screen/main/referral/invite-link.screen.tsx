import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'
import Hyperlink from 'react-native-hyperlink'

import ioc from '../../../ioc'
import { sizes } from '../../../common/constrants'
import { colors as colorsV2 } from '../../../common/colorV2'
import { fonts as fontsV2 } from '../../../common/typefaceV2'

import { Button } from '../../../component/button'
import { Spacer, VSpacer } from '../../../component/spacer'

import { InviteLinkBLoC } from './invite-link.bloc'
import QRCode from 'react-native-qrcode-svg'

export const InviteLinkScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: '',
}

export const InviteLinkScreen = observer(props => {
  const bloc = ioc.useBLoC(InviteLinkBLoC, props)

  const onCopyPress = useCallback(() => bloc.onCopy(), [bloc])
  const onCopyReferralCode = useCallback(() => bloc.onCopyReferralCode(), [bloc])
  const onSharePress = useCallback(() => bloc.onShare(), [bloc])
  const onLinkPress = useCallback(() => bloc.onLink(), [bloc])

  return (
    <ScrollView style={styles.list}>
      <SafeAreaView style={styles.container} edges={Edges}>
        <Text style={styles.title}>Invite Friends</Text>
        <Spacer height={40} />

        {/* TODO: need to implement */}
        {/*<View style={styles.avatarRow}>
          <AvatarWidget size={160} />
        </View>*/}

        <Text style={styles.qrCodeNote}>Have your friend scan this QR code</Text>
        <Spacer height={16} />

        <View style={styles.qrCodeWrapper}>
          <View style={styles.qrCodeContainer}>
            <QRCode
              logo={NeobankLogoSrc}
              logoSize={48}
              logoBackgroundColor={colorsV2.background}
              logoMargin={6}
              ecl={'M'}
              size={QRCodeSize}
              value={bloc.info.referralLink}
            />
          </View>
        </View>
        <Spacer height={24} />

        <Text style={styles.description}>{bloc.referralDescription}</Text>
        <Spacer height={40} />

        <Text style={styles.labelText}>Share Your Link</Text>
        <Spacer height={8} />

        <View style={styles.graySeparator} />
        <Spacer height={16} />

        <View style={styles.referralLinkRow}>
          <Hyperlink onPress={onLinkPress} injectViewProps={InjectLinkProps}>
            <Text style={styles.referralLink}>{bloc.croppedReferralLink}</Text>
          </Hyperlink>

          <View style={styles.referralBtnsContainer}>
            <Button style={styles.referralBtn} title={''} onPress={onCopyPress}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </Button>
            <VSpacer width={8} />
            <Button style={styles.referralBtn} title={''} onPress={onSharePress} loading={bloc.shareLoading}>
              <VectorImage width={24} height={24} source={ShareIconSrc} />
            </Button>
          </View>
        </View>
        <Spacer height={24} />

        <Text style={styles.labelText}>Share Your Code</Text>
        <Spacer height={8} />

        <View style={styles.graySeparator} />
        <Spacer height={16} />

        <View style={styles.referralLinkRow}>
          <Text style={styles.referralLink}>{bloc.referralCode}</Text>

          <View style={styles.referralBtnsContainer}>
            <Button style={styles.referralBtn} title={''} onPress={onCopyReferralCode}>
              <VectorImage style={styles.copyIcon} width={24} height={24} source={CopyIconSrc} />
            </Button>
          </View>
        </View>
        <Spacer height={24} />
      </SafeAreaView>
    </ScrollView>
  )
})

const Edges: Edge[] = ['bottom']
const InjectLinkProps = () => ({ suppressHighlighting: true })

const CopyIconSrc = require('../../../../assets/images/copy.icon.svg')
const ShareIconSrc = require('../../../../assets/images/share-v2.icon.svg')
const NeobankLogoSrc = require('../../../../assets/images/neobank-logo-v2.png')
const QRCodeSize = 215 // according to the design

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colorsV2.background,
  },
  container: {
    flex: 1,
    backgroundColor: colorsV2.background,
    paddingHorizontal: sizes.margin,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    ...fontsV2.h1Bold,
    color: colorsV2.text,
  },
  description: {
    textAlign: 'center',
    ...fontsV2.h1SemiBold,
    color: colorsV2.text,
  },
  labelText: {
    ...fontsV2.h6Regular,
    color: colorsV2.textLabel,
  },
  mainGreenText: {
    ...fontsV2.h1ExtraBold,
    color: colorsV2.accent,
  },
  graySeparator: {
    borderBottomWidth: 1,
    borderBottomColor: colorsV2.gray4,
  },
  referralLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralLink: {
    ...fontsV2.h2Regular,
    lineHeight: 32,
    color: colorsV2.text,
  },
  referralBtnsContainer: {
    flexDirection: 'row',
  },
  referralBtn: {
    padding: 12,
    backgroundColor: colorsV2.accent,
    borderColor: colorsV2.accent,
  },
  copyIcon: {
    tintColor: colorsV2.background,
  },
  link: {
    color: colorsV2.text,
  },

  qrCodeWrapper: {
    padding: 40,
    alignSelf: 'center',
    shadowColor: colorsV2.text,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 20,
    backgroundColor: colorsV2.background,
  },
  qrCodeContainer: {
    width: 215,
    height: 215,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrCodeNote: {
    ...fontsV2.h3Regular,
    color: colorsV2.textLabel,
    textAlign: 'center',
  },
})
