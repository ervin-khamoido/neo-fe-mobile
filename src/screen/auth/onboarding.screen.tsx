import { StackNavigationOptions } from '@react-navigation/stack'
import React, { Fragment, useCallback, useMemo, useRef } from 'react'
import { Text, StyleSheet, View, Dimensions, TouchableOpacity, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'

import { sizes } from '../../common/constrants'
import { colors as colorsV2 } from '../../common/colorV2'
import { fonts as fontsV2 } from '../../common/typefaceV2'

import { OnboardingBLoC } from './onboarding.bloc'
import { Button } from '../../component/button-v2'

import ioc from '../../ioc'
import { Spacer, VSpacer } from '../../component/spacer'
import VectorImage from 'react-native-vector-image'

export const OnboardingScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  headerBackTitle: '',
  animationEnabled: false,
}

export const OnboardingScreen = observer(props => {
  const bloc = ioc.useBLoC(OnboardingBLoC, props)

  const finishOnboarding = useCallback(() => bloc.finishOnboarding(), [bloc])
  const onNextPage = useCallback(() => bloc.onNextPage(), [bloc])
  const onScrollViewRef = useCallback(ref => (bloc.scrollRef = ref), [bloc])
  const scrollX = useRef(new Animated.Value(0))

  const onScrollAnimated = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { x: scrollX.current } } }], { useNativeDriver: true }),
    [scrollX],
  )

  const onScrollEnd = useCallback(
    ({
      nativeEvent: {
        contentOffset: { x },
      },
    }) => bloc.onScrollEnd(x),
    [bloc],
  )

  const renderDots = () => (
    <View style={styles.reCenter}>
      {OnboardingPages.map((_, index) => (
        <Fragment key={index}>
          <Dot index={index} scrollX={scrollX.current} />
          <VSpacer width={12} />
        </Fragment>
      ))}
    </View>
  )

  const renderScroll = () => {
    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        scrollEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onScroll={onScrollAnimated}
        ref={onScrollViewRef}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
      >
        {OnboardingPages.map((item, index) => (
          <OnboardingPage key={index} index={index} item={item} />
        ))}
      </Animated.ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={Edges}>
      <Spacer height={16} />

      {renderDots()}
      <Spacer height={64} />

      {renderScroll()}

      <View style={styles.btnsContainer}>
        {!bloc.finished ? (
          <View style={styles.btnsBody}>
            <TouchableOpacity onPress={finishOnboarding}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Spacer height={24} />
            <Button style={styles.nextBtn} textStyle={styles.nextBtnText} title="Next" onPress={onNextPage} />
          </View>
        ) : (
          <View style={styles.btnsBody}>
            <TouchableOpacity style={styles.btnHidden} onPress={finishOnboarding}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <Spacer height={24} />
            <Button
              style={styles.personalAccBtn}
              textStyle={styles.nextBtnText}
              title="Personal Account"
              onPress={finishOnboarding}
            />
          </View>
        )}
      </View>
      <Spacer height={24} />
    </SafeAreaView>
  )
})

type DotProps = {
  index: number
  scrollX: Animated.Value
}

const Dot = observer<DotProps>(({ index, scrollX }) => {
  const { width } = Dimensions.get('window')

  const dotStyles = useMemo(
    () => [
      styles.dot,
      styles.animatedView,
      {
        opacity: scrollX.interpolate({
          inputRange: [width * (index - 1), width * index, width * (index + 1)],
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        }),
      },
    ],
    [index, width, scrollX],
  )

  return <Animated.View key={index} style={dotStyles} />
})

type OnboardingPageProps = {
  index: number
  item: OnboardingContent
}

const OnboardingPage = observer<OnboardingPageProps>(({ index, item }) => {
  const containerStyle = useMemo(() => ({ width: getOnboardingPageSize(), paddingHorizontal: sizes.marginV2 }), [])

  const imageSize = getImageSize()
  const iconStyle = useMemo(() => [styles.onboardImgContent, { width: imageSize, height: imageSize }], [imageSize])

  return (
    <View key={index} style={containerStyle}>
      <Text style={styles.pageSubTitle}>{item.text}</Text>

      <View style={styles.onboardingImage}>
        <VectorImage width={getImageSize()} height={getImageSize()} style={iconStyle} source={item.image} />
      </View>
    </View>
  )
})

const getImageSize = () => Dimensions.get('window').width - 2 * 48

const Onboarding1 = require('../../../assets/images/onboarding-v2-one.icon.svg')
const Onboarding2 = require('../../../assets/images/onboarding-v2-two.icon.svg')
const Onboarding3 = require('../../../assets/images/onboarding-v2-three.icon.svg')
const Onboarding4 = require('../../../assets/images/onboarding-v2-four.icon.svg')

const Edges = ['top', 'bottom'] as any

export const getOnboardingPageSize = () => Dimensions.get('window').width

type OnboardingContent = {
  text: string
  image: any
}

export const OnboardingPages: OnboardingContent[] = [
  {
    text: 'Save in dollars and win up to a $1000 every week',
    image: Onboarding1,
  },
  {
    text: 'Send and receive digital dollars in minutes, anyone, anywhere',
    image: Onboarding2,
  },
  {
    text: 'Spend using your virtual debit card',
    image: Onboarding3,
  },
  {
    text: 'Safe and secure. US Regulated partners. Assets insured',
    image: Onboarding4,
  },
]

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: colorsV2.background,
  },
  reCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: sizes.marginV2,
  },
  animatedView: {
    height: 4,
    flexGrow: 1,
  },
  onboardingImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardImgContent: {},
  nextBtn: {
    backgroundColor: colorsV2.accent,
    borderColor: colorsV2.accent,
  },
  personalAccBtn: {
    backgroundColor: colorsV2.accent,
    borderColor: colorsV2.accent,
  },
  nextBtnText: {
    ...fontsV2.h2Regular,
  },
  skipText: {
    ...fontsV2.h4Regular,
    lineHeight: 24,
    color: colorsV2.textSecondary2,
    textAlign: 'center',
  },
  dot: {
    borderRadius: 2,
    backgroundColor: colorsV2.borderActive,
  },
  pageSubTitle: {
    ...fontsV2.h1Regular,
    color: colorsV2.text,
  },

  btnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sizes.marginV2,
  },
  btnsBody: {
    flexGrow: 1,
  },
  btnHidden: {
    opacity: 0,
  },
})
