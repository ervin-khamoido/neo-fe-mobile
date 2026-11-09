import { TextStyle } from 'react-native'
import { colors } from './constrants'

enum FontName {
  Inter = 'Inter',
  Black = 'Inter-Black',
  Bold = 'Inter-Bold',
  ExtraBold = 'Inter-ExtraBold',
  ExtraLight = 'Inter-ExtraLight',
  Light = 'Inter-Light',
  Medium = 'Inter-Medium',
  Regular = 'Inter-Regular',
  SemiBold = 'Inter-SemiBold',
  Thin = 'Inter-Thin',
}

export const fonts = Object.freeze({
  numbersL: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  numbersM: {
    fontSize: 48,
    lineHeight: 64,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  numbersS: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  numbersXS: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  numbersXXS: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  inter: {
    fontSize: 48,
    lineHeight: 72,
    fontWeight: '500',
    fontFamily: FontName.Inter,
  } as TextStyle,
  textSemiBoldS: {
    fontSize: 40,
    lineHeight: 56,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h1Regular: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h1PreSemiBold: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '500',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h1SemiBold: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h1Bold: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,
  h1ExtraBold: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: FontName.ExtraBold,
  } as TextStyle,

  h2Regular: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h2SemiBold: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h2Bold: {
    fontSize: 20,
    lineHeight: 32,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,
  h2BoldNoWeight: {
    fontSize: 20,
    lineHeight: 32,
    fontFamily: FontName.Bold,
  } as TextStyle,

  h3Regular: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h3SemiBold: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h3Bold: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,

  h4Thin: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '100',
    fontFamily: FontName.Thin,
  } as TextStyle,
  h4Regular: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h4PreSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h4SemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h4Bold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,

  h5Regular: {
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h5SemiBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h5Bold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,
  h5BoldNoWeight: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: FontName.Bold,
  } as TextStyle,

  h6Regular: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: FontName.Regular,
  } as TextStyle,
  h6PreSemiBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h6SemiBold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontFamily: FontName.SemiBold,
  } as TextStyle,
  h6Bold: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    fontFamily: FontName.Bold,
  } as TextStyle,
})

export const titles = Object.freeze({
  pinTitle: {
    color: colors.text,
    ...fonts.h2Regular,
    textAlign: 'center',
  } as TextStyle,
  pinTitleError: {
    color: colors.danger,
    ...fonts.h2Regular,
    textAlign: 'center',
  } as TextStyle,
  pinTitleReset: {
    ...fonts.h1SemiBold,
  } as TextStyle,
})
