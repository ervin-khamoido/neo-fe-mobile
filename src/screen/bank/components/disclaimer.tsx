import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'
import { Spacer } from '../../../component/spacer'

type DisclaimerProps = {
  disclaimer: string
}

export const AddBankAccountDisclaimer = memo<DisclaimerProps>(props => {
  const { disclaimer } = props
  if (disclaimer) {
    return (
      <View>
        <Spacer height={30} />
        <Text style={styles.disclaimer}>
          <Text style={styles.bold}>Disclaimer: </Text>
          {disclaimer}
        </Text>
      </View>
    )
  }
  return <React.Fragment></React.Fragment>
})

const styles = StyleSheet.create({
  bold: {
    ...fonts.h5SemiBold,
    color: colors.text,
  },
  disclaimer: {
    ...fonts.h5Regular,
    color: colors.text,
    marginBottom: 80,
  },
})
