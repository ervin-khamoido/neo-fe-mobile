import React, { useCallback } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { observer } from 'mobx-react-lite'
import { StackNavigationOptions } from '@react-navigation/stack'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import VectorImage from 'react-native-vector-image'

import ioc from '../../../ioc'
import { colors, sizes } from '../../../common/constrants'
import { fonts } from '../../../common/typeface'

import { Button } from '../../../component/button'
import { Spacer } from '../../../component/spacer'

import { SelectWidget } from '../../../widget/select.widget'
import { Input } from '../../../component/form/input'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaxLength } from '../../../component/max-length'

import { EmailSupportBLoC } from './email-support.bloc'

export const EmailSupportScreenOptions: StackNavigationOptions = {
  headerShown: true,
  title: 'Email Support',
}

export const EmailSupportScreen = observer(props => {
  const bloc = ioc.useBLoC(EmailSupportBLoC, props)

  const onChange = useCallback((name, value) => bloc.onChange(name, value), [bloc])
  const onSubmit = useCallback(() => bloc.onSubmit(), [bloc])
  const onDone = useCallback(() => bloc.onDone(), [bloc])

  const renderSupportForm = () => (
    <>
      <Spacer height={26} />
      <Text style={styles.title}>How can we help you?</Text>

      <Spacer height={28} />
      <SelectWidget
        name="issue"
        value={bloc.data.issue}
        placeholder="Select your issue"
        items={bloc.issues}
        disabled={bloc.loading}
        textStyle={styles.selectInput}
        onChange={onChange}
        valueSelector={titleSelector}
        titleSelector={titleSelector}
        searchHandler={searchHandler}
      />

      <Spacer height={44} />
      <Text style={styles.title}>Description</Text>

      <Spacer height={6} />
      <Text style={styles.description}>Help us better understand the issue. In the best way you can.</Text>

      <Spacer height={16} />

      <MaxLength currentLength={bloc.data.description.length} maxLength={500}>
        <Input
          style={styles.descriptionInput}
          name="description"
          placeholder="Type here..."
          multiline
          numberOfLines={12}
          maxLength={500}
          editable={!bloc.loading}
          value={bloc.data.description}
          onChange={onChange}
        />
      </MaxLength>

      <Spacer height={-1} />
      <Spacer height={20} />
      <Button title="Submit" onPress={onSubmit} disabled={bloc.disabled || bloc.loading} loading={bloc.loading} />
      <Spacer height={10} />
    </>
  )

  const renderSentSuccess = () => (
    <View style={styles.centerContainer}>
      <Spacer height={-1} />
      <VectorImage style={styles.checkmarkIcon} height={120} width={120} source={CheckmarkIcon} />
      <Text style={styles.centerDescription}>
        We’ve received your query. We will get back to you via e-mail in the next 24 hours.
      </Text>
      <Spacer height={-1} />
      <Button style={styles.doneButton} title="Done" onPress={onDone} />
      <Spacer height={20} />
    </View>
  )

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraHeight={130}
      extraScrollHeight={130}
      enableAutomaticScroll={Platform.OS === 'ios'}
      keyboardShouldPersistTaps="always"
      style={styles.list}
      contentContainerStyle={styles.listContent}
    >
      <SafeAreaView style={styles.container} edges={Edges}>
        {bloc.successfullySent ? renderSentSuccess() : renderSupportForm()}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  )
})

const Edges: Edge[] = ['bottom']

const CheckmarkIcon = require('../../../../assets/images/checkmark.icon.svg')

const titleSelector = (item: string) => item
const searchHandler = (search: string, items: string[]) => items.filter(x => x.toLowerCase().includes(search))

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: sizes.margin,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...fonts.h2SemiBold,
    color: colors.text,
  },
  selectInput: {
    ...fonts.h2Regular,
  },
  description: {
    ...fonts.h3Regular,
    color: colors.text,
  },
  descriptionInput: {
    ...fonts.h3Regular,
    height: 200,
    borderWidth: 1,
    borderColor: colors.borderLight2,
    borderRadius: 8,
    textAlignVertical: 'top',
    paddingBottom: 20,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centerDescription: {
    ...fonts.h3Regular,
    color: colors.text,
    textAlign: 'center',
    width: '90%',
  },
  doneButton: {
    alignSelf: 'stretch',
  },
  checkmarkIcon: {
    width: 120,
    height: 120,
  },
})
