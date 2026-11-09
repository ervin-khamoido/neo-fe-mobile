import React, { memo } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'

import { Spacer } from '../../component/spacer'
import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'
import VectorImage from 'react-native-vector-image'

const ConnectivityIssuesIcon = require('../../../assets/images/connectivity-issues.svg')

export const ConnectivityIssuesView = memo(() => (
  <View style={styles.container}>
    <View>
      <VectorImage style={styles.connectivityIssuesIcon} width={173} height={173} source={ConnectivityIssuesIcon} />
    </View>

    <Spacer height={16} />
    <Text style={styles.subheader}>Connectivity Issues. Please check your network connection and try again.</Text>
    <Spacer height={110} />
  </View>
))

const ImageSize = Dimensions.get('window').width * 0.4

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  connectivityIssuesIcon: {
    width: ImageSize,
    height: ImageSize,
  },
  subheader: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.h3SemiBold,
  },
})
