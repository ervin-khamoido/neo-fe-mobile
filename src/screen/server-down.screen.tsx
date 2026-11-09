import React, { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'

import ioc from '../ioc'

import { colors } from '../common/constrants'
import { Spacer } from '../component/spacer'
import { fonts } from '../common/typeface'

import { ServerDownBLoC } from './server-down.bloc'

export const ServerDownScreenOptions: StackNavigationOptions = {
  headerShown: false,
}

const TechnicalDifficulties = require('../../assets/images/technical-difficulties.png')

export const ServerDownScreen = memo(props => {
  const bloc = ioc.useBLoC(ServerDownBLoC, props)

  return (
    <Observer>
      {() => (
        <View style={styles.container}>
          <Image style={styles.technicalDifficultiesIcon} source={TechnicalDifficulties} />
          <Spacer height={16} />
          <Text style={styles.header}>Services Temporarily Unavailable</Text>
          <Text style={styles.subheader}>
            Due to high traffic on Neobank App we’ve disabled a few features temporarily.
          </Text>
        </View>
      )}
    </Observer>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  technicalDifficultiesIcon: {
    width: '80%',
  },
  header: {
    width: '80%',
    textAlign: 'center',
    color: colors.text,
    ...fonts.h2SemiBold,
  },
  subheader: {
    color: colors.text,
    ...fonts.h3Regular,
  },
})
