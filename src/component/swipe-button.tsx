import React, { useCallback, useMemo, useRef, useState } from 'react'
import { PanResponder, Animated, StyleSheet, ViewStyle, ImageStyle, TextStyle, ActivityIndicator } from 'react-native'
import VectorImage from 'react-native-vector-image'
import { colors } from '../common/colorV2'
import { observer } from 'mobx-react-lite'
import { fonts } from '../common/typefaceV2'

type SwipeButtonPropTypes = {
  containerStyle?: ViewStyle
  swipedContainerStyle?: ViewStyle
  containerColor?: string
  swipedContainerColor?: string

  labelStyle?: TextStyle
  swipedLabelStyle?: TextStyle
  labelColor?: string
  swipedLabelColor?: string

  buttonStyle?: ViewStyle
  swipedButtonStyle?: ViewStyle
  buttonColor?: string
  swipedButtonColor?: string
  buttonPinnedSince?: number // 0-1

  label: string
  swipedLabel?: string

  icon?: any
  swipedIcon?: any
  iconStyle?: ImageStyle
  swipedIconStyle?: ImageStyle

  loading?: boolean
  loadingIndicatorColor?: string
  loadingIndicatorSize?: LoadingIndicatorSizeType
  disabled?: boolean
  styledDisabled?: boolean

  onSwipeSuccess: () => void
}

type LoadingIndicatorSizeType = number | 'small' | 'large'

export const SwipeButton = observer<SwipeButtonPropTypes>(
  ({
    containerStyle,
    swipedContainerStyle,
    containerColor = colors.accent,
    swipedContainerColor = colors.accent,

    buttonStyle,
    swipedButtonStyle,
    buttonColor = colors.background,
    swipedButtonColor = colors.background,
    buttonPinnedSince = BUTTON_PINNED_SINCE,

    label,
    swipedLabel = label,
    labelColor = colors.textLight,
    swipedLabelColor = colors.textLightTransparent,
    swipedLabelStyle,
    labelStyle,

    icon = ArrowRightIconSrc,
    swipedIcon = CheckmarkIconSrc,
    swipedIconStyle,
    iconStyle,

    loading,
    loadingIndicatorColor = colors.background,
    loadingIndicatorSize = 'small',
    disabled,
    styledDisabled,

    onSwipeSuccess,
  }) => {
    const [isBtnActive, setIsBtnActive] = useState(false)
    const [isBtnSwiped, setIsBtnSwiped] = useState(false)
    const [containerWidth, setContainerWidth] = useState(0)
    const [buttonWidth, setButtonWidth] = useState(0)

    const pan = useRef(new Animated.ValueXY()).current
    const [animatedValue] = useState(new Animated.Value(0))

    const contColor = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [containerColor, swipedContainerColor],
    })

    const btnColor = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [buttonColor, swipedButtonColor],
    })

    const textColor = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [labelColor, swipedLabelColor],
    })

    const containerStyles = useMemo(
      () =>
        StyleSheet.flatten([
          styles.container,
          containerStyle,
          isBtnSwiped && swipedContainerStyle,
          { backgroundColor: styledDisabled ? colors.disabledBackground5 : contColor },
        ]),
      [isBtnSwiped, contColor, styledDisabled, swipedContainerStyle, containerStyle],
    )

    const textStyles = useMemo(
      () =>
        StyleSheet.flatten([
          styles.text,
          labelStyle,
          isBtnSwiped && swipedLabelStyle,
          { color: styledDisabled ? colors.textDisabled2 : textColor },
        ]),
      [isBtnSwiped, styledDisabled, textColor, labelStyle, swipedLabelStyle],
    )

    const buttonIcon = isBtnSwiped ? swipedIcon : icon

    const buttonStyles = useMemo(
      () =>
        StyleSheet.flatten([
          styles.btn,
          buttonStyle,
          isBtnSwiped && swipedButtonStyle,
          { backgroundColor: styledDisabled ? colors.disabledBackground6 : btnColor },
          { transform: [{ translateX: pan.x }] },
        ]),
      [isBtnSwiped, btnColor, pan.x, styledDisabled, swipedButtonStyle, buttonStyle],
    )

    const iconStyles = useMemo(
      () =>
        StyleSheet.flatten([
          styles.icon,
          iconStyle,
          isBtnSwiped && swipedIconStyle,
          styledDisabled && {
            tintColor: colors.disabledBackground5,
          },
        ]),
      [isBtnSwiped, styledDisabled, iconStyle, swipedIconStyle],
    )

    const panResponder = useMemo(
      () =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderStart: () => {
            if (disabled || styledDisabled) {
              return
            }

            setIsBtnActive(true)
          },
          onPanResponderMove: (_, gestureState) => {
            if (disabled || styledDisabled || !isBtnActive) {
              return
            }

            const { dx } = gestureState

            if (dx <= containerWidth - buttonWidth) {
              pan.setValue({ x: dx, y: 0 })
            }

            if (dx <= 0) {
              pan.setValue({ x: 0, y: 0 })
            }

            const toValue = (dx * (100 + buttonWidth)) / Math.max(0.1, containerWidth - buttonWidth)

            Animated.timing(animatedValue, {
              toValue: toValue >= 100 ? 100 : toValue,
              duration: 1,
              useNativeDriver: false,
            }).start()
          },
          onPanResponderRelease: (_, gestureState) => {
            if (disabled || styledDisabled) {
              return
            }

            const containerWidthWithoutBtnWidth = containerWidth - buttonWidth

            if (isBtnActive && gestureState.dx > containerWidthWithoutBtnWidth * buttonPinnedSince) {
              pan.setValue({ x: containerWidthWithoutBtnWidth, y: 0 })
              setIsBtnSwiped(true)

              Animated.timing(animatedValue, {
                toValue: 100,
                duration: 100,
                useNativeDriver: false,
              }).start()

              onSwipeSuccess()
              return
            }

            Animated.spring(pan, {
              toValue: 0,
              useNativeDriver: false,
              mass: 0.1,
            }).start()

            Animated.timing(animatedValue, {
              toValue: 0,
              duration: 100,
              useNativeDriver: false,
            }).start()

            setIsBtnActive(false)
            setIsBtnSwiped(false)
          },
        }),
      [
        animatedValue,
        buttonPinnedSince,
        buttonWidth,
        containerWidth,
        disabled,
        isBtnActive,
        onSwipeSuccess,
        pan,
        styledDisabled,
      ],
    )

    const handleContainerLayout = useCallback(event => {
      const { width } = event.nativeEvent.layout
      setContainerWidth(width)
    }, [])

    const handleButtonLayout = useCallback(event => {
      const { width } = event.nativeEvent.layout
      setButtonWidth(width + BTN_OFFSET * 2)
    }, [])
    // const handleButtonLayout = useCallback(
    //   event => {
    //     const { width } = event.nativeEvent.layout
    //
    //     let includeOffset = BTN_LEFT_OFFSET * 2
    //
    //     if (buttonStyle?.left && typeof buttonStyle?.left === 'string' && containerWidth) {
    //       includeOffset = containerWidth * (parseFloat(buttonStyle.left) / 100) * 2
    //     }
    //
    //     if (typeof buttonStyle.left === 'number') {
    //       includeOffset = buttonStyle.left * 2
    //     }
    //
    //     setButtonWidth(width + includeOffset)
    //   },
    //   [containerWidth, buttonStyle?.left],
    // )
    const buttonLabel = isBtnSwiped ? swipedLabel : label

    return (
      <Animated.View onLayout={handleContainerLayout} style={containerStyles}>
        <Animated.View onLayout={handleButtonLayout} style={buttonStyles} {...panResponder.panHandlers}>
          <VectorImage source={buttonIcon} width={20} height={20} style={iconStyles} />
        </Animated.View>

        {loading ? (
          <ActivityIndicator size={loadingIndicatorSize} color={loadingIndicatorColor} />
        ) : (
          <Animated.Text style={textStyles}>{buttonLabel}</Animated.Text>
        )}
      </Animated.View>
    )
  },
)

const CheckmarkIconSrc = require('../../assets/images/checkmark-v2.icon.svg')
const ArrowRightIconSrc = require('../../assets/images/arrow-right.icon.svg')

const BUTTON_PINNED_SINCE = 0.65
const BTN_OFFSET = 5

const styles = StyleSheet.create({
  container: {
    padding: 5,
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: colors.accent,
  },
  text: {
    textAlign: 'center',
    ...fonts.h2Regular,
    color: colors.textLight,
    zIndex: -1,
  },
  btn: {
    width: 50,
    height: 50,
    position: 'absolute',
    left: BTN_OFFSET,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 100,
  },
  icon: {
    tintColor: colors.accent,
    width: 20,
    height: 20,
  },
})
