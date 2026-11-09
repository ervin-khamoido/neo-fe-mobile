import React, { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'

import ioc from '../../ioc'

import { colors, sizes } from '../../common/constrants'

import { BuildInfoBloc } from './build-info.bloc'
import { fonts } from '../../common/typeface'
import { OutlineButton } from '../../component/button'
import { Spacer } from '../../component/spacer'

export const BuildInfoScreenOptions: StackNavigationOptions = {
  headerShown: true,
  headerTitle: 'Build Info',
}

const CopyIconSrc = require('../../../assets/images/copy.icon.svg')

export const BuildInfoScreen = memo(props => {
  const bloc = ioc.useBLoC(BuildInfoBloc, props)

  const onCopyToClipboard = useCallback(key => bloc.onCopyToClipboard(key), [bloc])
  const onSumSubStart = useCallback(() => bloc.onSumSubStart(), [bloc])

  return (
    <Observer>
      {() => (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          {bloc.dopplerEnv === 'dev' && (
            <>
              <OutlineButton style={styles.btn} title="Test SumSub: kyc_level_2" onPress={onSumSubStart} />
              <Spacer height={30} />
            </>
          )}

          {bloc.keys.map(key => (
            <KeyValueItem key={key} itemKey={key} value={bloc.info[key]} onCopyToClipboard={onCopyToClipboard} />
          ))}
        </ScrollView>
      )}
    </Observer>
  )
})

type KeyValueItemProps = {
  itemKey: string
  value: string | number | boolean

  onCopyToClipboard: (key: string) => void
}
const KeyValueItem = memo<KeyValueItemProps>(({ itemKey: key, value, onCopyToClipboard }) => {
  const onCopy = useCallback(() => onCopyToClipboard(key), [key, onCopyToClipboard])

  return (
    <View key={key} style={styles.row}>
      <Text style={styles.key}>{key}</Text>
      <Text style={styles.value}>{`${value}`}</Text>
      <TouchableOpacity onPress={onCopy}>
        <VectorImage style={styles.copyIcon} width={32} height={32} source={CopyIconSrc} />
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingBottom: 100,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: sizes.margin,
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  key: {
    flex: 1,
    ...fonts.h5SemiBold,
    color: colors.text,
  },
  value: {
    ...fonts.h5Regular,
    color: colors.textSecondaryDark,
    marginHorizontal: 10,
  },

  btn: {
    marginHorizontal: 20,
  },
  copyIcon: {
    width: 32,
    height: 32,
  },
})
