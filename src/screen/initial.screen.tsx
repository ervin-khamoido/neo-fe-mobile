import React, { useCallback } from 'react'
import { Observer, observer } from 'mobx-react-lite'

import ioc from '../ioc'

import { MainNavigator } from './main'
import { AuthNavigator } from './auth'

import { InitialBLoC } from './initial.bloc'
import { ServerDownView } from './component/server-down.view'

import { SigningUpModal } from './widget/signing-up-modal.widget'
import { SigningOutModal } from './widget/signing-out-modal.widget'
import { CodeVerifyModal } from './widget/code-verify-modal.widget'

import { ConnectivityIssuesView } from './component/connectivity-issues.view'
import { BlockNavigator } from './block'
import { UpdateAlertScreen } from './app-versions/update-alert.screen'
import { EnableLockScreen } from './main/app-lock/enable-lock.screen'

export const InitialScreen = observer(props => {
  const bloc = ioc.useBLoC(InitialBLoC, props)

  const onSignInRetry = useCallback(() => bloc.onSignInRetry(), [bloc])
  const renderView = () => {
    // TODO: refactor. a) move to modal b) move to currentRootView
    if (!bloc.appIsConnectedToInternet) {
      return <ConnectivityIssuesView />
    } else if (bloc.isAuthFailure) {
      return <ServerDownView loading={bloc.singInPending} onRetry={onSignInRetry} />
    } else if (bloc.showUpdateAlert) {
      return <UpdateAlertScreen />
    } else if (bloc.user && !bloc.isAppLockEnabled) {
      return <EnableLockScreen />
    } else {
      switch (bloc.currentRootView) {
        case 'Main':
          return <MainNavigator />
        case 'Auth':
          return <AuthNavigator />
        case 'Blocked':
          return <BlockNavigator />
        default:
          return null
      }
    }
  }
  return (
    <Observer>
      {() => (
        <>
          {renderView()}

          <CodeVerifyModal />
          <SigningUpModal />
          <SigningOutModal />
        </>
      )}
    </Observer>
  )
})
