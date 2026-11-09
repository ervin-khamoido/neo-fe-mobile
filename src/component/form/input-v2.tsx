import React, { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View } from 'react-native'
import { colors } from '../../common/colorV2'
import { fonts } from '../../common/typefaceV2'
import RNPhoneInput from 'react-native-phone-input/dist'
import { CodeField, Cursor, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { RenderCellOptions } from 'react-native-confirmation-code-field/esm/CodeField'
import { format } from 'date-fns'
import VectorImage from 'react-native-vector-image'
import DatePicker from 'react-native-date-picker'
import { DateInputProps } from './input'

export type InputProps = {
  name: string
  onChange: (name: string, value: string) => void

  forwardRef?: React.LegacyRef<TextInput>
} & Omit<TextInputProps, 'onChangeText' | 'onChange' | 'onTextInput'>
export const Input = memo<InputProps>(props => {
  const { name, onChange, style, forwardRef, ...otherProps } = props

  const inputStyle = useMemo(() => StyleSheet.flatten([styles.inputText, style]), [style])
  const onInputChange = useCallback(value => onChange(name, value), [name, onChange])

  return (
    <TextInput
      ref={forwardRef}
      placeholderTextColor={colors.textSecondary2}
      {...otherProps}
      style={inputStyle}
      onChangeText={onInputChange}
      underlineColorAndroid={'transparent'}
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
    <View key={index} style={styles.cell}>
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
      <VectorImage style={styles.calendarIcon} width={24} height={24} source={CalenderIcon} />

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
    padding: 8,
  },
  inputText: {
    ...fonts.h2Regular,
    color: colors.text,
  },

  // code input
  codeInputTxt: {
    textAlign: 'center',
    ...fonts.numbersS,
    lineHeight: 56,
    color: colors.text,
  },
  cell: {
    marginHorizontal: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
    maxWidth: 72,
    width: '100%',
    height: 80,
    backgroundColor: colors.background2,
    borderRadius: 12,
    color: colors.text,
  },

  // date input
  dateInput: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateInputText: {
    flexGrow: 1,
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
})
