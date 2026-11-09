import * as React from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors } from '../../../../common/constrants'
import { fonts } from '../../../../common/typeface'

interface Props {
  onColor?: string
  offColor?: String
  onToggle: () => void
  isOn: boolean
  currentCurrency: string
  style?: {}
}

export function CurrencySwitchInput({ onColor, offColor, onToggle, style, isOn, currentCurrency }: Props) {
  const animatedValue = useMemo(() => new Animated.Value(0), [])
  const useOnToggle = useCallback(() => {
    onToggle()
  }, [onToggle])

  const moveToggle = animatedValue.interpolate({
    inputRange: [-0.15, 0.905],
    outputRange: [0, 26],
  })
  useEffect(() => {
    animatedValue.setValue(isOn ? 0 : 1)
    Animated.timing(animatedValue, {
      useNativeDriver: false,
      toValue: isOn ? 1 : 0,
      duration: 200,
      easing: Easing.linear,
    }).start()
  }, [isOn, animatedValue])
  //const color = isOn ? onColor : offColor
  // can be used in the future if this toggle ever needs to use different colors
  // const animate = () => {

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={useOnToggle}>
        <View style={[styles.toggleContainer, style]}>
          {isOn && (
            <View style={styles.leftSymbolContainer}>
              <Text style={styles.leftSymbolText}>{currentCurrency}</Text>
            </View>
          )}
          <View style={styles.leftSymbolContainer}>
            <Text style={styles.leftSymbolText}>{currentCurrency}</Text>
          </View>
          <Animated.View
            style={[
              styles.toggleWheelStyle,
              {
                marginLeft: moveToggle,
              },
            ]}
          />
        </View>
        {!isOn && (
          <View style={styles.rightSymbolContainer}>
            <Text style={styles.rightSymbolText}>{currentCurrency}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleContainer: {
    width: 50,
    height: 23,
    marginLeft: 3,
    borderRadius: 15,
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  toggleWheelStyle: {
    width: 18,
    height: 18,
    backgroundColor: 'white',
    borderRadius: 12.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 1.5,
    zIndex: 99,
  },
  leftSymbolContainer: {
    position: 'absolute',
    top: 1,
    left: 10,
    zIndex: 1,
  },
  leftSymbolText: {
    color: colors.input,
    ...fonts.h5SemiBold,
  },
  rightSymbolContainer: {
    position: 'absolute',
    top: 1,
    right: 12,
    zIndex: 1,
  },
  rightSymbolText: {
    ...fonts.h5SemiBold,
    color: colors.input,
  },
})
