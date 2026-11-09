import { Platform, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '../common/constrants'
import { fonts } from '../common/typeface'

export const ButtonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 32,
    padding: 18,
  },
  text: {
    ...fonts.h3SemiBold,
    color: colors.textLight,
    textAlign: 'center',
  },
  disabledContainer: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBackground,
  },
  disabledText: {
    color: colors.textDisabled,
  },

  outlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 32,
    padding: 18,
  },
  outlineText: {
    ...fonts.h3Regular,
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
})
