import { useEffect, useLayoutEffect, useState } from 'react'
import { Container, interfaces } from 'inversify'
import { NavigationContainerRef } from '@react-navigation/core'
import Toast from 'react-native-toast-notifications'

import { configureComponentScope } from './component.scope'
import { NavigatorSymbol, ToastSymbol } from '../symbols'

let container: Container

function setContainer(iocContainer: Container): void {
  container = iocContainer
}

function bindNavigator(navigator: NavigationContainerRef<object> | null): void {
  if (container.isBound(NavigatorSymbol)) {
    container.rebind(NavigatorSymbol).toConstantValue(navigator)
  } else {
    container.bind(NavigatorSymbol).toConstantValue(navigator)
  }
}

function bindToast(toast: Toast): void {
  container.rebind<Toast | null>(ToastSymbol).toConstantValue(toast)
}

export interface IBLoC<TProps = unknown, TParams = unknown> {
  onParamsChange(props: TProps, params: TParams)

  onRequestClose?(): boolean
  onDestroy?(): void

  onScreenFocus?(): void
  onScreenBlur?(): void
}

export interface IWizardable {
  wizardId: string
}

function useBLoC<T extends IBLoC<TProps>, TProps extends Record<string, any>>(
  ctor: interfaces.Newable<T>,
  props: TProps,
): T {
  const [bloc] = useState(() => {
    const blocContainer = configureComponentScope(container, props)
    return blocContainer.resolve(ctor)
  })

  useLayoutEffect(() => {
    const { route: { params = {} } = {}, ...otherProps } = props

    bloc.onParamsChange(otherProps as TProps, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloc, props, ...Object.values(props)])

  useEffect(() => {
    return () => bloc.onDestroy?.()
  }, [bloc])

  const { navigation } = props
  useEffect(() => {
    if (!navigation) {
      return
    }

    const onScreenRemove = e => {
      if (bloc.onRequestClose && !bloc.onRequestClose()) {
        e.preventDefault()
      }
    }

    const beforeRemoveUnsubscribe = navigation.addListener('beforeRemove', onScreenRemove)
    return () => beforeRemoveUnsubscribe()
  }, [bloc, navigation])

  useEffect(() => {
    if (!navigation) {
      return
    }

    const onScreenFocus = () => bloc.onScreenFocus?.()
    const onScreenBlur = () => bloc.onScreenBlur?.()

    const focusUnsubscribe = navigation.addListener('focus', onScreenFocus)
    const blurUnsubscribe = navigation.addListener('blur', onScreenBlur)
    return () => {
      focusUnsubscribe()
      blurUnsubscribe()
    }
  }, [bloc, navigation])

  return bloc
}

const ioc = {
  setContainer,
  bindNavigator,
  bindToast,
  useBLoC,
}

export default ioc
