import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react-lite'
import VectorImage from 'react-native-vector-image'
import { colors as colorsV2 } from '../common/colorV2'
import { fonts as fontsV2 } from '../common/typefaceV2'

interface IAlertProps {
  text: string
  amount?: string | number
  showNextBtn?: boolean
  nextBtnDisabled?: boolean
  onClickNextBtn?: () => void
}

export const Alert = observer<IAlertProps>(
  ({ onClickNextBtn = null, showNextBtn = false, nextBtnDisabled = false, amount, text }) => {
    return (
      <TouchableOpacity disabled={nextBtnDisabled} onPress={onClickNextBtn}>
        <View style={styles.alert}>
          <View style={styles.alertClockContainer}>
            <VectorImage style={styles.alertClockIcon} width={24} height={24} source={ClockIconSrc} />
          </View>

          <View style={styles.alertBodyContainer}>
            <View>
              <Text style={styles.alertText}>{text}</Text>
              {!!amount && <Text style={styles.alertAmount}>{amount}</Text>}
            </View>

            {showNextBtn && onClickNextBtn && (
              <VectorImage style={styles.nextIcon} width={24} height={24} source={NextIconSrc} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  },
)

const ClockIconSrc = require('../../assets/images/clock.icon.svg')
const NextIconSrc = require('../../assets/images/chevron-right.icon.svg')

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertClockContainer: {
    padding: 24,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: colorsV2.blue,
  },
  alertClockIcon: {
    tintColor: colorsV2.background,
  },
  alertBodyContainer: {
    height: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingLeft: 12,
    paddingRight: 16,
    backgroundColor: colorsV2.gray8,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  alertText: {
    ...fontsV2.h4Regular,
    color: colorsV2.text,
  },
  alertAmount: {
    ...fontsV2.h3SemiBold,
    color: colorsV2.text,
  },
  nextIcon: {
    tintColor: colorsV2.primary,
  },
})
