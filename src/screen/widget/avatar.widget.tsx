import React, { useCallback, useMemo } from 'react'
import { StyleSheet, Image, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'

import ioc from '../../ioc'
import { colors } from '../../common/constrants'

import { AvatarBLoC } from './avatar.bloc'
import LinearGradient from 'react-native-linear-gradient'

export type AvatarWidgetProps = {
  size: number
  editable?: boolean
}
export const AvatarWidget = observer<AvatarWidgetProps>(props => {
  const bloc = ioc.useBLoC(AvatarBLoC, props)
  const { size, editable } = bloc.props

  /* TODO: add photo update functionality */
  const onChangeAvatar = useCallback(() => bloc.onChangeAvatar(), [bloc])

  const avatarPlugIconSrc = editable ? CameraIconSrc : PictureIconSrc
  const avatarPlugIconSize = editable ? 24 : 32

  const avatarWrapperStyles = useMemo(() => ({ width: size, height: size }), [size])
  const imageSrc = useMemo(() => ({ uri: bloc.avatarUrl }), [bloc.avatarUrl])

  return (
    <View style={avatarWrapperStyles}>
      {bloc.avatarUrl ? (
        <Image source={imageSrc} />
      ) : (
        <LinearGradient
          style={styles.avatarPlug}
          colors={Colors}
          start={GradientDirection.start}
          end={GradientDirection.end}
        >
          <VectorImage width={avatarPlugIconSize} height={avatarPlugIconSize} source={avatarPlugIconSrc} />
        </LinearGradient>
      )}
    </View>
  )
})

const CameraIconSrc = require('../../../assets/images/camera.icon.svg')
const PictureIconSrc = require('../../../assets/images/picture.icon.svg')

const GradientDirection = {
  start: { x: 1, y: 1 },
  end: { x: 0, y: 0 },
}

const Colors = ['#34A655', '#41D16D']

const styles = StyleSheet.create({
  avatarPlug: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight2,
    borderRadius: 100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 4,
  },
})
