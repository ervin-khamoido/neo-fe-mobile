import { Platform, StyleSheet, ViewStyle } from 'react-native'

import { colors } from '../common/colorV2'
import { fonts } from '../common/typefaceV2'

const ButtonBorderWidth = 1

export const ButtonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: ButtonBorderWidth,
    borderColor: colors.accent,
    borderRadius: 50,
    paddingVertical: 18 - ButtonBorderWidth,
    paddingHorizontal: 24 - ButtonBorderWidth,
  },
  text: {
    ...fonts.h2Regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  disabledContainer: {
    backgroundColor: colors.disabledBackground3,
    borderColor: colors.disabledBackground3,
  },
  disabledText: {
    color: colors.textDisabled2,
  },
  outlinedDisabledContainer: {
    borderColor: colors.disabled,
  },
  outlinedDisabledText: {
    color: colors.disabled,
  },

  // accent btn
  accentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: ButtonBorderWidth,
    borderColor: colors.accent,
    borderRadius: 50,
    paddingVertical: 18 - ButtonBorderWidth,
    paddingHorizontal: 24 - ButtonBorderWidth,
  },
  accentText: {
    ...fonts.h2Regular,
    color: colors.textLight,
    textAlign: 'center',
  },
  accentDisabledContainer: {
    backgroundColor: colors.textDisabled2,
    borderColor: colors.textDisabled2,
  },
  accentDisabledText: {},

  outlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: ButtonBorderWidth,
    borderColor: colors.accent,
    borderRadius: 32,
    paddingVertical: 18 - ButtonBorderWidth,
    paddingHorizontal: 24 - ButtonBorderWidth,
  },
  outlineText: {
    ...fonts.h2Regular,
    color: colors.accent,
    textAlign: 'center',
  },

  utilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.utilityBackground,
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  utilityText: {
    ...fonts.h4Regular,
    color: colors.text,
    textAlign: 'center',
  },

  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    ...fonts.h5Bold,
    color: colors.primary,
    textAlign: 'center',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

const commonDottedLine: ViewStyle = {
  borderStyle: 'dashed',
  width: '100%',
  borderColor: colors.borderLight2,
}

const iosDottedLine: ViewStyle = {
  height: 1,
  borderWidth: 1,
  borderRadius: 1,
}
const androidDottedLine: ViewStyle = {
  borderTopWidth: 1,
  borderBottomWidth: 0,
  borderRightWidth: 0,
  borderLeftWidth: 0,
  borderBottomColor: colors.background,
}

export const MiscStyles = StyleSheet.create({
  dottedLine:
    Platform.OS === 'ios'
      ? {
          ...commonDottedLine,
          ...iosDottedLine,
        }
      : { ...commonDottedLine, ...androidDottedLine },
  solidLine: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight2,
  },
  solidLine2: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: colors.border2,
  },
})
