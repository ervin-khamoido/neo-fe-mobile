import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, Pressable, PressableProps } from 'react-native'
import RNPhoneInput from 'react-native-phone-input/dist'
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { RenderCellOptions } from 'react-native-confirmation-code-field/esm/CodeField'
import VectorImage from 'react-native-vector-image'
import DatePicker from 'react-native-date-picker'

import { colors } from '../../common/constrants'
import { fonts } from '../../common/typeface'
import { format } from 'date-fns'

export type InputProps = {
  name: string
  onChange: (name: string, value: string) => void

  forwardRef?: React.LegacyRef<TextInput>
} & Omit<TextInputProps, 'onChangeText' | 'onChange' | 'onTextInput'>
export const Input = memo<InputProps>(props => {
  const { name, onChange, style, forwardRef, ...otherProps } = props

  const inputStyle = useMemo(() => StyleSheet.flatten([styles.input, styles.inputText, style]), [style])
  const onInputChange = useCallback(value => onChange(name, value), [name, onChange])

  return (
    <TextInput
      ref={forwardRef}
      placeholderTextColor={colors.textSecondary}
      {...otherProps}
      style={inputStyle}
      onChangeText={onInputChange}
    />
  )
})

type PhoneInputProps = {
  name: string
  textStyle?: TextStyle
  forwardRef?: React.RefObject<RNPhoneInput>

  onChange: (name: string, value: string) => void
} & Omit<TextInputProps, 'onChangeText' | 'onChange' | 'onTextInput'>
export const PhoneInput = memo<PhoneInputProps>(props => {
  const { name, value, onChange, style, textStyle, forwardRef, ...otherProps } = props

  const inputStyle = useMemo(() => StyleSheet.flatten([styles.input, style]), [style])
  const textStyle_ = useMemo(() => StyleSheet.flatten([styles.inputText, { height: 36 }, textStyle]), [textStyle])
  const onPhoneChange = useCallback(x => onChange(name, x), [name, onChange])

  return (
    <RNPhoneInput
      {...otherProps}
      ref={forwardRef}
      textStyle={textStyle_}
      style={inputStyle}
      initialValue={value}
      onChangePhoneNumber={onPhoneChange}
      autoFormat
      initialCountry={'ng'}
      onPressFlag={() => {}}
    />
  )
})

type CodeInputProps = {
  cells?: number

  name: string
  onChange: (name: string, value: string) => void
} & Omit<TextInputProps, 'onChangeText' | 'onChange' | 'onTextInput'>
export const CodeInput = memo<CodeInputProps>(props => {
  const { name, value, onChange, cells = 6, style, ...otherProps } = props

  const onCodeChange = useCallback(x => onChange(name, x), [name, onChange])

  const [, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onCodeChange,
  })

  const renderCell = ({ index, symbol, isFocused }: RenderCellOptions) => (
    <View key={index} style={styles.cellFocus}>
      <Text style={styles.codeInputTxt} onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
      </Text>
    </View>
  )

  return (
    <CodeField
      rootStyle={style}
      {...otherProps}
      value={value}
      cellCount={cells}
      onChangeText={onCodeChange}
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      renderCell={renderCell}
      autoFocus={true}
    />
  )
})

export type DateInputProps = {
  name: string
  value?: Date
  defaultPickerValue: Date
  onChange: (name: string, value: Date) => void

  textStyle?: TextStyle
  maxDate?: Date
} & Omit<PressableProps, 'onPress'>
export const DateInput = memo<DateInputProps>(props => {
  const { name, value, defaultPickerValue, onChange, style, textStyle, maxDate, ...otherProps } = props

  const inputStyle = useMemo(() => StyleSheet.flatten([styles.input, styles.dateInput, style]), [style])
  const inputTextStyle = useMemo(
    () => StyleSheet.flatten([styles.inputText, styles.dateInputText, textStyle]),
    [textStyle],
  )

  const [open, setOpen] = useState(false)
  const onInputPress = useCallback(() => setOpen(true), [setOpen])
  const onModalConfirm = useCallback(
    value => {
      setOpen(false)
      onChange(name, value)
    },
    [name, setOpen, onChange],
  )
  const onModalCancel = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Pressable style={inputStyle} onPress={onInputPress}>
      <Text style={inputTextStyle}>{value ? format(value, 'MMM d, yyyy') : ''}</Text>
      <VectorImage style={styles.calenderIcon} width={24} height={24} source={CalenderIcon} />

      <DatePicker
        modal
        mode="date"
        open={open}
        date={value ?? defaultPickerValue}
        maximumDate={maxDate}
        onConfirm={onModalConfirm}
        onCancel={onModalCancel}
      />
    </Pressable>
  )
})

const CalenderIcon = require('../../../assets/images/calendar.icon.svg')

const styles = StyleSheet.create({
  input: {
    flex: 0,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputText: {
    ...fonts.h1Regular,
    lineHeight: undefined,
    color: colors.text,
  },

  // code input
  codeInputTxt: {
    ...fonts.numbersS,
    fontSize: 33,
    lineHeight: 50,

    flex: 1,
    textAlign: 'center',
    color: colors.text,
  },
  cellFocus: {
    width: 50,
    height: 63,
    borderBottomWidth: 1,
    borderBottomColor: colors.text,
    color: colors.text,
  },

  dateInput: {
    flexDirection: 'row',
  },
  dateInputText: {
    flexGrow: 1,
  },

  calenderIcon: {
    width: 24,
    height: 24,
  },
})
