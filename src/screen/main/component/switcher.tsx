import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Pressable, Animated } from 'react-native'
import { colors } from '../../../common/colorV2'
import { fonts } from '../../../common/typefaceV2'
import { observer } from 'mobx-react-lite'
import { CurrencyCode } from '../../../common/constrants'

type SwitchPropsType = {
  switched: boolean
  leftText?: CurrencyCode
  rightText?: CurrencyCode

  handleToggle: () => void
}

export const Switch = observer<SwitchPropsType>(
  ({ switched, handleToggle, leftText = CurrencyCode.USD, rightText = CurrencyCode.NGN }) => {
    const [animatedValue] = useState(new Animated.Value(0))
    const [animatedTextValue] = useState(new Animated.Value(0))

    const toValue = useCallback(() => (switched ? 0 : 52), [switched])()

    const interpolatedTranslateX = animatedValue.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 100],
    })

    const usdTextColor = animatedTextValue.interpolate({
      inputRange: [0, 52],
      outputRange: [colors.text, colors.textLight],
    })

    const ngnTextColor = animatedTextValue.interpolate({
      inputRange: [0, 52],
      outputRange: [colors.textLight, colors.text],
    })

    const usdTextStyles = useMemo(() => StyleSheet.flatten([styles.text, { color: usdTextColor }]), [usdTextColor])

    const ngnTextStyles = useMemo(() => StyleSheet.flatten([styles.text, { color: ngnTextColor }]), [ngnTextColor])

    const switchBtnStyles = useMemo(
      () => StyleSheet.flatten([styles.switchBtn, { transform: [{ translateX: interpolatedTranslateX }] }]),
      [interpolatedTranslateX],
    )

    const handleClick = useCallback(() => {
      Animated.timing(animatedValue, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }).start()

      Animated.timing(animatedTextValue, {
        toValue: toValue,
        duration: 150,
        delay: 75,
        useNativeDriver: false,
      }).start()

      handleToggle()
    }, [animatedTextValue, animatedValue, handleToggle, toValue])

    return (
      <Pressable style={styles.container} onPress={handleClick}>
        <Animated.Text style={usdTextStyles}>{leftText.toUpperCase()}</Animated.Text>
        <Animated.Text style={ngnTextStyles}>{rightText.toUpperCase()}</Animated.Text>
        <Animated.View style={switchBtnStyles} />
      </Pressable>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 106,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background3,
    cursor: 'pointer',
  },
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 2,
    left: 2,
    width: 50,
    height: 28,
    backgroundColor: colors.background,
    borderRadius: 16,
    zIndex: -1,
  },
  text: {
    ...fonts.h5Regular,
    lineHeight: 17,
    color: colors.textLight,
  },
})
