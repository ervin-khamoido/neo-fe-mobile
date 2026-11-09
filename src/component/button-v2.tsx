import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native'
import React, { memo, useMemo } from 'react'
import { ButtonStyles } from './common-v2'
import { colors } from '../common/constrants'

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
  const {
    title,
    style,
    loading,
    textStyle,
    contentPosition = 'left',
    disabled,
    children,
    indicatorColor,
    ...otherProps
  } = props

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
          {/* TODO:
            size={'small'} has been changed to size={24}:
            it has impact on the button with the airplane icon on Wallet screen, when changed here,
            all buttons with icons and loaders should be retested*/}
          <ActivityIndicator color={indicatorColor ?? colors.textLight} size={24} />
        </View>
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
      {!loading && contentPosition === 'right' && children}
    </TouchableOpacity>
  )
})

export const OutlineButton = memo<ButtonProps>(props => {
  const { title, style, loading, indicatorColor, children, textStyle, disabled, ...otherProps } = props

  const titleStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.outlineText, disabled ? ButtonStyles.outlinedDisabledText : {}, textStyle]),
    [textStyle, disabled],
  )
  const containerStyle = useMemo(
    () =>
      StyleSheet.flatten([
        ButtonStyles.outlineContainer,
        disabled ? ButtonStyles.outlinedDisabledContainer : {},
        style,
      ]),
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

export const UtilityButton = memo<ButtonProps>(props => {
  const { title, style, loading, indicatorColor, children, textStyle, disabled, ...otherProps } = props

  const titleStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.utilityText, disabled ? ButtonStyles.disabledText : {}, textStyle]),
    [textStyle, disabled],
  )
  const containerStyle = useMemo(
    () => StyleSheet.flatten([ButtonStyles.utilityContainer, disabled ? ButtonStyles.disabledContainer : {}, style]),
    [style, disabled],
  )
  const loadingTextStyle = useMemo(
    () => [ButtonStyles.loaderContainer, { height: textStyle?.lineHeight ?? ButtonStyles.utilityText.lineHeight }],
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
