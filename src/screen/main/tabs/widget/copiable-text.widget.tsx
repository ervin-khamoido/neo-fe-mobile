import React, { memo, PropsWithChildren, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text, TextProps, TouchableOpacity, View, ViewProps } from 'react-native'

import ioc from '../../../../ioc'

import { CopiableTextBLoC } from './copiable-text.bloc'
import VectorImage from 'react-native-vector-image'
import { colors as colorsV2 } from '../../../../common/colorV2'

export type CopiableTextWidgetProps = {
  copyText: string
  showCopyIcon?: boolean

  containerStyle?: ViewProps['style']
  style?: TextProps['style']
}
export const CopiableTextWidget = memo<PropsWithChildren<CopiableTextWidgetProps>>(props => {
  const { style, containerStyle, children } = props
  const bloc = ioc.useBLoC(CopiableTextBLoC, props)

  const cStyle = useMemo(() => [styles.container, containerStyle], [containerStyle])
  const onCopy = useCallback(() => bloc.onTextCopy(), [bloc])

  return (
    <TouchableOpacity style={cStyle} onPress={onCopy}>
      <Text style={style}>{children}</Text>
      {bloc.showCopyIcon && <VectorImage style={styles.copyIcon} width={16} height={16} source={CopyIconSrc} />}
    </TouchableOpacity>
  )
})

const CopyIconSrc = require('../../../../../assets/images/copy-v2.icon.svg')

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyIcon: {
    marginLeft: 3,
    tintColor: colorsV2.accent,
    width: 16,
    height: 16,
  },
})
