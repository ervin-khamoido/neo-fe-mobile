import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated'
import { colors } from '../common/colorV2'
import { fonts } from '../common/typefaceV2'
import VectorImage from 'react-native-vector-image'

const BUTTON_HEIGHT = 60
const BUTTON_PADDING = 4
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 2 * BUTTON_PADDING

type SwipeButtonREAProps = {
  name: string
  value: boolean

  label: string

  onChange: (name: string, value: boolean) => void
}
export const SwipeButtonREA = memo<SwipeButtonREAProps>(props => {
  const { name, value, label, onChange } = props

  const buttonWidth = useSharedValue(100)
  const swipeRange = useDerivedValue(() => buttonWidth.value - 2 * BUTTON_PADDING - SWIPEABLE_DIMENSIONS, [buttonWidth])

  // Animated value for X translation
  const X = useSharedValue(value ? swipeRange.value : 0)

  // Fires when animation ends
  const handleComplete = useCallback(
    (newValue: boolean) => {
      if (value !== newValue) {
        onChange(name, newValue)
      }
    },
    [name, value, onChange],
  )

  // Gesture Handler Events
  const animatedGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { completed: boolean }>(
    {
      onStart: (_, ctx) => {
        ctx.completed = value
      },
      onActive: (e, ctx) => {
        let newValue
        if (ctx.completed) {
          newValue = swipeRange.value + e.translationX
        } else {
          newValue = e.translationX
        }

        if (newValue >= 0 && newValue <= swipeRange.value) {
          X.value = newValue
        }
      },
      onEnd: () => {
        if (X.value < buttonWidth.value / 2 - SWIPEABLE_DIMENSIONS / 2) {
          X.value = withSpring(0)
          runOnJS(handleComplete)(false)
        } else {
          X.value = withSpring(swipeRange.value)
          runOnJS(handleComplete)(true)
        }
      },
    },
    [swipeRange, value],
  )

  const AnimatedStyles = {
    swipeable: useAnimatedStyle(() => {
      return {
        transform: [{ translateX: X.value }],
      }
    }, [X]),
    swipeText: useAnimatedStyle(() => {
      const InterpolateXInput = [0, swipeRange.value]
      return {
        opacity: interpolate(X.value, InterpolateXInput, [1, 0], Extrapolate.CLAMP),
        transform: [
          {
            translateX: interpolate(
              X.value,
              InterpolateXInput,
              [0, buttonWidth.value / 2 - SWIPEABLE_DIMENSIONS],
              Extrapolate.CLAMP,
            ),
          },
        ],
      }
    }, [X, buttonWidth]),
  }

  const onContainerLayout = useCallback(
    ({
      nativeEvent: {
        layout: { width },
      },
    }) => {
      buttonWidth.value = width
      X.value = value ? swipeRange.value : 0
    },
    [buttonWidth, swipeRange, X, value],
  )

  return (
    <Animated.View style={styles.swipeCont} onLayout={onContainerLayout}>
      <PanGestureHandler onGestureEvent={animatedGestureHandler}>
        <Animated.View style={[styles.swipeable, AnimatedStyles.swipeable]}>
          <VectorImage style={styles.arrowRightIcon} width={24} height={24} source={ArrowRightSrc} />
        </Animated.View>
      </PanGestureHandler>
      <Animated.Text style={[styles.swipeText, AnimatedStyles.swipeText]}>{label}</Animated.Text>
    </Animated.View>
  )
})

const ArrowRightSrc = require('../../assets/images/arrow-right.icon.svg')

const styles = StyleSheet.create({
  swipeCont: {
    height: BUTTON_HEIGHT,
    backgroundColor: colors.background,
    borderRadius: BUTTON_HEIGHT,
    padding: BUTTON_PADDING,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  colorWave: {
    position: 'absolute',
    left: 0,
    height: BUTTON_HEIGHT,
    borderRadius: BUTTON_HEIGHT,
    backgroundColor: colors.accent,
  },
  swipeable: {
    position: 'absolute',
    left: BUTTON_PADDING,
    height: SWIPEABLE_DIMENSIONS,
    width: SWIPEABLE_DIMENSIONS,
    borderRadius: SWIPEABLE_DIMENSIONS,
    zIndex: 3,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    ...fonts.h2Regular,
    alignSelf: 'center',
    zIndex: 2,
    color: colors.accent,
  },
  arrowRightIcon: {
    tintColor: colors.accent,
    width: 24,
    height: 24,
  },
})
