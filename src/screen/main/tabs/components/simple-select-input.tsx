import React, { useCallback, useMemo, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import VectorImage from 'react-native-vector-image'

import { Spacer, VSpacer } from '../../../../component/spacer'
import { BottomModal } from '../../../../component/modals/bottom-modal'
import { fonts } from '../../../../common/typefaceV2'
import { colors } from '../../../../common/colorV2'
import { OutlineButton } from '../../../../component/button-v2'

type SimpleSelectInputPropsType = {
  title: string
  name: string
  value: string
  options: SimpleSelectInputOption[]
  onChange: (name: string, value: SimpleSelectInputOption) => void
}

type SimpleSelectInputOption = {
  icon: any
  label: string
  value: string
}

export const SimpleSelectInput = observer<SimpleSelectInputPropsType>(({ title, options, name, onChange, value }) => {
  const [showModal, setShowModal] = useState(false)

  const onShowModal = useCallback(() => {
    setShowModal(true)
  }, [])

  const onHideModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const onPress = useCallback(
    optionValue => {
      onChange(name, optionValue)
      onHideModal()
    },
    [name, onChange, onHideModal],
  )

  const selectBtnStyles = useMemo(
    () => StyleSheet.flatten([value ? styles.optionRowBtnSelected : styles.optionRowBtn]),
    [value],
  )

  const renderItem = useCallback(
    ({ item }) => (
      <>
        <TouchableOpacity style={styles.itemContainer} key={item.value} onPress={() => onPress(item)}>
          <VectorImage style={styles.selectIcon} width={24} height={24} source={item.icon} />
          <VSpacer width={12} />
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
        <Spacer height={20} />

        <View style={styles.line} />
        <Spacer height={24} />
      </>
    ),
    [onPress],
  )

  const renderBtnContent = useCallback(
    data => (
      <>
        {data ? (
          <>
            <VectorImage style={styles.contentIcon} width={16} height={16} source={data.icon} />
            <VSpacer width={4} />
            <Text style={styles.btnLabel}>{data.label}</Text>
          </>
        ) : (
          <Text style={styles.btnLabelLight}>Select</Text>
        )}
      </>
    ),
    [],
  )

  return (
    <>
      <OutlineButton style={selectBtnStyles} textStyle={styles.optionRowBtnText} title="" onPress={onShowModal}>
        {renderBtnContent(value)}
      </OutlineButton>

      <BottomModal visible={showModal} swipeable={true} onBackdropPress={onHideModal} onSwipeDown={onHideModal}>
        <Text style={styles.title}>{title}</Text>
        <Spacer height={24} />

        <View style={styles.line} />
        <Spacer height={20} />

        <FlatList data={options} keyExtractor={keyExtractor} renderItem={renderItem} />
      </BottomModal>
    </>
  )
})

const keyExtractor = (item: SimpleSelectInputOption) => item.value

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    ...fonts.h1SemiBold,
    color: colors.text,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...fonts.h4SemiBold,
    color: colors.text,
  },
  line: {
    borderBottomColor: colors.border2,
    borderBottomWidth: 1,
  },

  optionRowBtnSelected: {
    paddingVertical: 3,
    paddingHorizontal: 15,
    borderColor: colors.primary,
    backgroundColor: colors.gray8,
  },
  optionRowBtn: {
    paddingVertical: 3,
    paddingHorizontal: 15,
    borderColor: colors.tabInactive,
    backgroundColor: colors.background,
  },
  optionRowBtnText: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textSecondary3,
  },

  btnLabel: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.text,
  },
  btnLabelLight: {
    ...fonts.h4Regular,
    lineHeight: 24,
    color: colors.textSecondary3,
  },
  selectIcon: {
    width: 24,
    height: 24,
  },
  contentIcon: {
    width: 16,
    height: 16,
  },
})
