import React, { useCallback } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react-lite'
import { SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'

import ioc from '../../ioc'
import { fonts } from '../../common/typefaceV2'
import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'

import { Spacer } from '../../component/spacer'
import { Button } from '../../component/button-v2'

import { UpdateAlertBLoC } from './update-alert.bloc'

export const UpdateAlertScreen = observer(props => {
  const bloc = ioc.useBLoC(UpdateAlertBLoC, props)

  const onUpdateApp = useCallback(() => bloc.onUpdate(), [bloc])
  const onSkip = useCallback(() => bloc.onSkip(), [bloc])

  return (
    <SafeAreaView edges={Edges} style={styles.container}>
      <Spacer height={16} />

      {bloc.showSkipBtn && (
        <View style={styles.row}>
          <TouchableOpacity onPress={onSkip}>
            <Text style={styles.skipBtn}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      <Spacer height={76} />
      <View style={styles.circleWrapper}>
        <VectorImage style={styles.pictureIcon} width={150} height={150} source={NeobankGreenIconLogoIconSrc} />
      </View>
      <Spacer height={24} />

      <Text style={styles.header}>Update Required</Text>
      <Spacer height={8} />

      <Text style={styles.subheader}>
        We know that updating your app can be a hassle, but we’ve made some important changes. Please update to the
        latest version to keep using Neobank App.
      </Text>
      <Spacer height={-1} />

      <Button style={styles.btn} title="Update" loading={bloc.loading} disabled={bloc.loading} onPress={onUpdateApp} />
      <Spacer height={24} />
    </SafeAreaView>
  )
})

const NeobankGreenIconLogoIconSrc = require('../../../assets/images/neobank-green-icon-logo-v2.icon.svg')
const Edges = ['top', 'bottom'] as any

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: sizes.marginV2,
  },
  header: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.h1SemiBold,
  },
  subheader: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.h4Regular,
    lineHeight: 24,
  },
  circleWrapper: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  btn: {
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skipBtn: {
    ...fonts.h4Thin,
    color: colors.gray6,
    ...fonts.h4Thin,
    lineHeight: 16,
  },
  avatarPlug: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight2,
    borderRadius: 100,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 4,
  },
  pictureIcon: {
    width: 150,
    height: 150,
  },
})
