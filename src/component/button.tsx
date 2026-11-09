import React, { memo, useMemo } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  TextProps,
  View,
  TextStyle,
} from 'react-native'

import { ButtonStyles } from './common'
import { colors } from '../common/constrants'
import { fonts } from '../common/typeface'

type ButtonProps = {
  title: string
  loading?: boolean
  indicatorColor?: string
  type?: 'primary' | 'secondary'
  contentPosition?: 'right' | 'left'
  tapTargets?: TouchableOpacityProps['hitSlop']

  textStyle?: TextStyle
} & TouchableOpacityProps
export const Button = memo<ButtonProps>(props => {
  const { title, style, loading, textStyle, contentPosition = 'left', disabled, children, ...otherProps } = props

  const containerStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.container, disabled ? ButtonStyles.disabledContainer : {}, style]),
    [style, disabled],
  )
  const textStyles = useMemo(
    () => StyleSheet.flatten([ButtonStyles.text, disabled ? ButtonStyles.disabledText : {}, textStyle]),
    [textStyle, disabled],
  )
  const loadingTextStyle = useMemo(
    () => [ButtonStyles.loaderContainer, { height: textStyle?.lineHeight ?? ButtonStyles.text.lineHeight }],
    [textStyle],
  )

  return (
    <TouchableOpacity {...otherProps} disabled={disabled} style={containerStyle}>
      {!loading && contentPosition === 'left' && children}
      {loading ? (
        <View style={loadingTextStyle}>
          <ActivityIndicator color={colors.textLight} size={'small'} />
        </View>
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {!loading && contentPosition === 'right' && children}
    </TouchableOpacity>
  )
})

export const LinkButton = memo<ButtonProps>(props => {
  const { children, tapTargets, title, style, textStyle, type, loading, indicatorColor, ...otherProps } = props

  const containerStyle = useMemo(() => StyleSheet.flatten([styles.linkContainer, style]), [style])
  const textStyle_ = useMemo(() => {
    switch (type) {
      case 'primary':
        return StyleSheet.flatten([styles.linkTextPrimary, textStyle])
      default:
        return StyleSheet.flatten([styles.linkText, textStyle])
    }
  }, [textStyle, type])

  return (
    <TouchableOpacity {...otherProps} style={containerStyle} hitSlop={tapTargets}>
      {!loading && children}
      {loading ? (
        <>
          <Text style={textStyle_}>
            {' '}
            <ActivityIndicator color={indicatorColor ? indicatorColor : colors.primary} size={'small'} />
          </Text>
        </>
      ) : (
        <Text style={textStyle_}>{title}</Text>
      )}
    </TouchableOpacity>
  )
})

export const OutlineButton = memo<ButtonProps>(props => {
  const { title, style, loading, indicatorColor, children, textStyle, disabled, ...otherProps } = props

  const titleStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.outlineText, disabled ? ButtonStyles.disabledText : {}, textStyle]),
    [textStyle, disabled],
  )
  const containerStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.outlineContainer, disabled ? ButtonStyles.disabledContainer : {}, style]),
    [style, disabled],
  )
  const loadingTextStyle = useMemo(
    () => [ButtonStyles.loaderContainer, { height: textStyle?.lineHeight ?? ButtonStyles.text.lineHeight }],
    [textStyle],
  )

  return (
    <TouchableOpacity {...otherProps} disabled={disabled} style={containerStyle}>
      {!loading && children}
      {loading ? (
        <>
          <View style={loadingTextStyle}>
            <ActivityIndicator color={indicatorColor ? indicatorColor : colors.primary} size={'small'} />
          </View>
        </>
      ) : (
        <Text style={titleStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  )
})

export const BadgeButton = memo<ButtonProps>(props => {
  const { title, style, loading, ...otherProps } = props

  const containerStyle = useMemo(() => StyleSheet.flatten([ButtonStyles.badgeContainer, style]), [style])

  return (
    <TouchableOpacity {...otherProps} style={containerStyle}>
      {loading ? (
        <>
          <Text style={ButtonStyles.badgeText}>
            <ActivityIndicator color={colors.primary} size={'small'} />
          </Text>
        </>
      ) : (
        <Text style={ButtonStyles.badgeText}>{title}</Text>
      )}
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  icon: {
    fontSize: 17,
    marginRight: 5,
    color: colors.textLight,
  },

  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 3,
  },
  linkIcon: {
    fontSize: 17,
    marginRight: 5,
    color: colors.primary,
  },
  linkText: {
    ...fonts.h5Regular,
    color: '#000000',
    textAlign: 'center',
  },
  linkTextPrimary: {
    ...fonts.h5Bold,
    color: colors.primary,
    textAlign: 'center',
  },
})
