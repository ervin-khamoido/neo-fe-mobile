import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Spacer, VSpacer } from '../../../component/spacer'
import VectorImage from 'react-native-vector-image'
import React, { useState } from 'react'
import { fonts as fontsV2 } from '../../../common/typefaceV2'
import { colors as colorsV2 } from '../../../common/colorV2'
import { sizes } from '../../../common/constrants'
import { HelpCenterArticle, HelpCenterSection } from '../../../models'
import { observer } from 'mobx-react-lite'

interface ICollapsibleProps {
  sections: HelpCenterSection[]
  showHeader?: boolean
  showSectionHeader?: boolean
  showChatSection?: boolean
  hasUnreadFreshchat?: boolean

  onViewAll?: () => void
  onChat?: () => void
}

interface ICollapsibleSectionProps {
  item: HelpCenterSection
}

export const Collapsible = observer<ICollapsibleProps>(
  ({
    sections,
    showHeader = false,
    showSectionHeader = true,
    onViewAll,
    showChatSection,
    onChat,
    hasUnreadFreshchat,
  }) => {
    const [selectedId, setExpandedId] = useState(null)
    const toggleCollapsible = id => () => setExpandedId(selectedId === id ? null : id)

    const renderCollapsibleHeader = () => (
      <>
        <View style={styles.collapsibleGroupHeader}>
          <Text style={styles.collapsibleGroupHeaderTitle}>Frequently Asked Questions</Text>

          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.collapsibleGroupHeaderViewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>
        <Spacer height={8} />

        <View style={styles.line} />
        <Spacer height={20} />
      </>
    )

    const renderCollapsibleSection = ({ item: { title, data } }: ICollapsibleSectionProps) => (
      <>
        {showSectionHeader && (
          <>
            <Text style={styles.collapsibleGroupHeaderTitle}>{title}</Text>
            <Spacer height={8} />

            <View style={styles.line} />
            <Spacer height={8} />
          </>
        )}

        {data.map(renderCollapsibleRow)}
        {showChatSection && onChat && renderChatSection()}
      </>
    )

    const renderCollapsibleRow = (article: HelpCenterArticle) => {
      const { id, title, description } = article

      const arrowStyles =
        selectedId === id ? styles.collapsibleItemArrowIconActive : styles.collapsibleItemArrowIconDisable

      return (
        <View key={id}>
          <TouchableOpacity onPress={toggleCollapsible(id)}>
            <Spacer height={12} />
            <View style={styles.collapsibleItemHeader}>
              <Text style={styles.collapsibleItemTitle}>{title}</Text>

              <VectorImage style={arrowStyles} width={24} height={24} source={ChevronRightIcon} />
            </View>
          </TouchableOpacity>

          {selectedId === id ? (
            <>
              <Spacer height={8} />
              <Text style={styles.collapsibleItemInfo}>{description}</Text>
              <Spacer height={20} />
            </>
          ) : (
            <Spacer height={20} />
          )}

          <View style={styles.line} />
          <Spacer height={8} />
        </View>
      )
    }

    const renderChatSection = () => {
      return (
        <>
          <TouchableOpacity style={styles.collapsibleItemHeader} onPress={onChat}>
            <View style={styles.messageIconWrapper}>
              <VectorImage width={24} height={24} source={MessageIcon} />
            </View>
            <VSpacer width={12} />

            <View style={styles.row}>
              <View>
                <Spacer height={12} />
                <Text style={styles.collapsibleItemTitle}>Chat With Us</Text>
                <Text style={styles.collapsibleItemInfo}>Contact our team of experts</Text>
              </View>

              {!!hasUnreadFreshchat && <View style={styles.unreadBadge} />}

              <VectorImage width={24} height={24} source={ChevronRightIcon} />
            </View>
          </TouchableOpacity>
          <Spacer height={20} />
          <View style={styles.line} />
          <Spacer height={20} />
        </>
      )
    }

    return (
      <FlatList<HelpCenterSection>
        data={sections}
        renderItem={renderCollapsibleSection}
        keyExtractor={keyExtractor}
        ListHeaderComponent={showHeader && renderCollapsibleHeader}
        contentContainerStyle={styles.collapsibleGroup}
      />
    )
  },
)

const keyExtractor = x => x.id
const ChevronRightIcon = require('../../../../assets/images/chevron-right.icon.svg')
const MessageIcon = require('../../../../assets/images/message-circle.icon.svg')

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleGroup: {
    paddingHorizontal: sizes.marginV2,
    paddingBottom: 48,
  },
  collapsibleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleGroupHeaderTitle: {
    ...fontsV2.h6Regular,
    color: colorsV2.textLabel,
  },
  collapsibleGroupHeaderViewAllBtn: {
    ...fontsV2.h6Regular,
    color: colorsV2.text,
  },
  collapsibleItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleItemTitle: {
    ...fontsV2.h4SemiBold,
    color: colorsV2.text,
    flex: 1,
  },
  collapsibleItemInfo: {
    ...fontsV2.h4Regular,
    lineHeight: 24,
    color: colorsV2.textLabel,
  },
  collapsibleItemArrowIconDisable: {
    transform: [{ rotateZ: '90deg' }],
  },
  collapsibleItemArrowIconActive: {
    transform: [{ rotateZ: '-90deg' }],
  },
  line: {
    height: 0,
    borderBottomWidth: 1,
    borderBottomColor: colorsV2.border2,
  },
  messageIconWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: colorsV2.danger2,
    borderRadius: 8,
    top: 24,
    right: sizes.marginV2 * 1.5,
  },
})
