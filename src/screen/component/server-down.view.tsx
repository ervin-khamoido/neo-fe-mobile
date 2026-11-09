import React, { memo } from 'react'
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native'

import { Spacer } from '../../component/spacer'
import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'
import { Button } from '../../component/button'

const TechnicalDifficulties = require('../../../assets/images/technical-difficulties.png')

type ScreenDownViewProps = {
  loading: boolean
  onRetry: () => void
}
export const ServerDownView = memo<ScreenDownViewProps>(({ onRetry, loading }) => (
  <View style={styles.container}>
    <Image style={styles.technicalDifficultiesIcon} source={TechnicalDifficulties} resizeMode={'contain'} />
    <Spacer height={16} />
    <Text style={styles.header}>Services Temporarily Unavailable</Text>
    <Text style={styles.subheader}>
      We are experiencing some difficulties contacting our servers. Give us a few minutes and then please retry
    </Text>

    <Spacer height={-1} />

    <Button title="Retry" disabled={loading} loading={loading} style={styles.btn} onPress={onRetry} />
    <Spacer height={48} />
  </View>
))

const ImageSize = Dimensions.get('window').width * 0.8

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  technicalDifficultiesIcon: {
    width: ImageSize,
    height: ImageSize,
  },
  header: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.h2SemiBold,
  },
  subheader: {
    textAlign: 'center',
    color: colors.text,
    ...fonts.h3Regular,
  },
  btn: {
    width: '90%',
  },
})
