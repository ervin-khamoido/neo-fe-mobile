import React from 'react'
import { Platform, View } from 'react-native'
import { initialWindowMetrics } from 'react-native-safe-area-context'
import { StackNavigationOptions } from '@react-navigation/stack'
import VectorImage from 'react-native-vector-image'

import { sizes } from '../../common/constrants'
import { fonts } from '../../common/typefaceV2'

import { HeaderRightWidget } from './widget/header-right.widget'

const IOS_HEADER_LEFT_WIDTH_CORRECTION = 10
const ANDROID_HEADER_LEFT_WIDTH_CORRECTION = 10

const iOSInsetTop = Platform.OS === 'ios' ? initialWindowMetrics.insets.top : 0
const iOSInsetLeft = Platform.OS === 'ios' ? IOS_HEADER_LEFT_WIDTH_CORRECTION : 0

const AndroidInsetLeft = Platform.OS === 'android' ? ANDROID_HEADER_LEFT_WIDTH_CORRECTION : 0

const BackButtonIconStyle = {
  padding: Platform.OS === 'ios' ? IOS_HEADER_LEFT_WIDTH_CORRECTION : ANDROID_HEADER_LEFT_WIDTH_CORRECTION / 2,
}

const ChevronLeftIconSrc = require('../../../assets/images/chevron-left.icon.svg')

export const DefaultScreenOptions: StackNavigationOptions = {
  animationEnabled: true,
  headerBackTitle: null,
  headerBackTitleVisible: false,
  headerStyle: {
    borderBottomWidth: 0,
    shadowColor: 'transparent',
    height: sizes.headerHeightV2 + iOSInsetTop, // sizes.headerHeightV2 + iOSInsetTop, // you can't change the header height only in one part of the application
  },
  headerTitleStyle: {
    ...fonts.h2Regular,
  },
  headerLeftContainerStyle: {
    maxWidth: 70 - iOSInsetLeft - AndroidInsetLeft,
    alignItems: 'center',
  },

  headerRight: () => <HeaderRightWidget />,
  headerBackImage: () => (
    <View style={BackButtonIconStyle}>
      <VectorImage width={24} height={24} source={ChevronLeftIconSrc} />
    </View>
  ),
}
