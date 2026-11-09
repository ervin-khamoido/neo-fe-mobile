import { StackNavigationOptions } from '@react-navigation/stack'
import React, { Fragment, useCallback, useMemo, useRef } from 'react'
import { Text, StyleSheet, View, Dimensions, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'

import { sizes } from '../../common/constrants'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typefaceV2'

import { FeatureOnboardingBLoC } from './feature-onboarding.bloc'
import { Button } from '../../component/button-v2'

import ioc from '../../ioc'
import { Spacer, VSpacer } from '../../component/spacer'
import { IOnboardingScreenConfig, OnboardingType } from '../../models'
import { AvatarWidget } from '../widget/avatar.widget'

export const FeatureOnboardingScreenOptions: StackNavigationOptions = {
  headerShown: false,
  title: '',
  headerBackTitle: '',
  animationEnabled: false,
}

type FeatureOnboardingScreenPropsType = {
  type: OnboardingType
  screens: IOnboardingScreenConfig[]
}

export const FeatureOnboardingScreen = observer<FeatureOnboardingScreenPropsType>(props => {
  const bloc = ioc.useBLoC(FeatureOnboardingBLoC, props)

  const finishOnboarding = useCallback(() => bloc.finishOnboarding(), [bloc])
  const onNextPage = useCallback(totalScreenAmount => bloc.onNextPage(totalScreenAmount), [bloc])
  const onScrollViewRef = useCallback(ref => (bloc.scrollRef = ref), [bloc])
  const scrollX = useRef(new Animated.Value(0))

  const onboardingScreensAmount = onboardingScreens[bloc.onboardingType].length - 1
  const finished = bloc.currentPage === onboardingScreensAmount
  const onBtnPress = finished ? finishOnboarding : () => onNextPage(onboardingScreensAmount)

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
      {onboardingScreens[bloc.onboardingType].map((_, index) => (
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
        {onboardingScreens[bloc.onboardingType].map((item, index) => (
          <OnboardingScreen key={index} index={index} item={item} onPress={onBtnPress} loading={bloc.loading} />
        ))}
      </Animated.ScrollView>
    )
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={Edges}>
      <Spacer height={16} />

      {renderDots()}
      <Spacer height={40} />

      {renderScroll()}
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
  loading: boolean
  index: number
  item: IOnboardingScreenConfig
  onPress: () => void
}

const OnboardingScreen = observer<OnboardingPageProps>(({ index, item, onPress, loading }) => {
  const containerStyle = useMemo(() => ({ width: getOnboardingPageSize(), paddingHorizontal: sizes.marginV2 }), [])

  return (
    <View key={index} style={containerStyle}>
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Spacer height={80} />

      <View style={styles.onboardingImage}>
        {item.image ? (
          <VectorImage width={getImageSize()} height={getImageSize()} source={item.image} />
        ) : (
          <AvatarWidget size={160} editable={false} />
        )}
      </View>
      <Spacer height={-1} />

      <Text style={styles.pageDescription}>{item.description}</Text>
      <Spacer height={38} />

      <Button
        style={styles.submitBtn}
        textStyle={styles.submitBtnText}
        title={item.ctaButtonTxt}
        onPress={onPress}
        loading={loading}
        disabled={loading}
      />
    </View>
  )
})

const getImageSize = () => Dimensions.get('window').width - 2 * 48

const Edges = ['top', 'bottom'] as any

export const getOnboardingPageSize = () => Dimensions.get('window').width

const onboardingScreens: Record<OnboardingType, IOnboardingScreenConfig[]> = {
  [OnboardingType.PLS]: [
    {
      title: 'How does it work?',
      image: require('../../../assets/images/lock-trophy.icon.svg'),
      ctaButtonTxt: 'Next',
      description: 'Neobank App Saturday rewards you for saving money towards your future',
    },
    {
      title: 'Lock up your money',
      image: require('../../../assets/images/lock-tickets.icon.svg'),
      ctaButtonTxt: 'Next',
      description:
        'For every $10 you lock away, you earn 1 dream point valid through the lock period. The more dream points you have, the higher your chances of winning',
    },
    {
      title: 'Win Prizes',
      image: require('../../../assets/images/lock-badge.icon.svg'),
      ctaButtonTxt: 'Next',
      description: 'Every Saturday, we announce rewards. You can win up to $1,000',
    },
    {
      title: 'Save',
      image: require('../../../assets/images/lock-money.icon.svg'),
      ctaButtonTxt: 'Start Saving',
      description: 'Win or not, you never lose your deposits!\nReady to get started?',
    },
  ],
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: colors.background,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  submitBtnText: {
    ...fonts.h2Regular,
  },
  dot: {
    borderRadius: 2,
    backgroundColor: colors.borderActive,
  },
  pageTitle: {
    ...fonts.h1Regular,
    color: colors.text,
  },
  pageDescription: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
})
