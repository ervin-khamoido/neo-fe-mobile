import React, { Fragment, useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { StyleSheet, View } from 'react-native'
import { OutlineButton } from '../../../../component/button-v2'
import { colors } from '../../../../common/colorV2'
import { fonts } from '../../../../common/typefaceV2'
import { VSpacer } from '../../../../component/spacer'

type RadioButtonsInputPropsType = {
  options: TabOptionType[]
  value: string
  name: string
  onChange: (name: string, value: string) => void
}

type TabOptionType = {
  label: string
  value: string
  disabled?: boolean
}

export const RadioButtonsInput = observer<RadioButtonsInputPropsType>(({ options, value, onChange, name }) => {
  const handleRadioButtonPress = useCallback(
    selectedValue => {
      if (value !== selectedValue) {
        onChange(name, selectedValue)
      }
    },
    [name, onChange, value],
  )

  const renderTabBtn = (option: TabOptionType, index: number) => {
    const btnStyle = StyleSheet.flatten(value === option.value ? styles.btnActive : styles.btn)
    const btnTextStyle = StyleSheet.flatten(value === option.value ? styles.btnTextActive : styles.btnText)

    return (
      <Fragment key={option.value}>
        <View>
          <OutlineButton
            style={btnStyle}
            textStyle={btnTextStyle}
            title={option.label}
            onPress={() => handleRadioButtonPress(option.value)}
            disabled={option.disabled}
          />
        </View>

        {index !== options.length - 1 && <VSpacer width={11} />}
      </Fragment>
    )
  }

  return <View style={styles.container}>{options.map(renderTabBtn)}</View>
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: 11,
    borderColor: colors.tabInactive,
    backgroundColor: colors.background,
  },
  btnText: {
    ...fonts.h4Regular,
    color: colors.textSecondary3,
  },
  btnActive: {
    paddingVertical: 11,
    borderColor: colors.primary,
    backgroundColor: colors.gray8,
  },
  btnTextActive: {
    ...fonts.h4PreSemiBold,
    lineHeight: 20,
    color: colors.text,
  },
})
