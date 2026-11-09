import React, { memo } from 'react'
import { Observer } from 'mobx-react-lite'
import { createStackNavigator } from '@react-navigation/stack'

import ioc from '../../ioc'
import { BlockNavigatorDef } from '../common'

import { DefaultScreenOptions } from '../app-header/screen.options'

import { BlockBLoC } from './block.bloc'
import { HomeScreen, HomeScreenOptions } from './home.screen'
import { HelpCenterScreen, HelpCenterScreenOptions } from '../main/support/help-center.screen'
import { EmailSupportScreen, EmailSupportScreenOptions } from '../main/support/email-support.screen'
import { ContactSupportScreen, ContactSupportScreenOptions } from '../main/support/contact-support.screen'
import { FAQScreen, FAQScreenOptions } from '../main/support/faq.screen'

const BlockStack = createStackNavigator<BlockNavigatorDef>()

const DefaultParams = {
  mode: 'block',
}

export const BlockNavigator = memo(props => {
  const bloc = ioc.useBLoC(BlockBLoC, props)

  return (
    <Observer>
      {() => (
        <BlockStack.Navigator screenOptions={DefaultScreenOptions} initialRouteName="Home">
          <BlockStack.Screen name="Home" options={HomeScreenOptions} component={HomeScreen} />
          <BlockStack.Screen
            name="HelpCenter"
            options={HelpCenterScreenOptions}
            component={HelpCenterScreen}
            initialParams={DefaultParams}
          />
          <BlockStack.Screen
            name="ContactSupport"
            options={ContactSupportScreenOptions}
            component={ContactSupportScreen}
            initialParams={DefaultParams}
          />
          <BlockStack.Screen
            name="EmailSupport"
            options={EmailSupportScreenOptions}
            component={EmailSupportScreen}
            initialParams={DefaultParams}
          />
          <BlockStack.Screen
            name="FAQ"
            options={FAQScreenOptions}
            component={FAQScreen}
            initialParams={DefaultParams}
          />
        </BlockStack.Navigator>
      )}
    </Observer>
  )
})
