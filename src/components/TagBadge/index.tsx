import { TAG_MAP } from '@/constants/tags'
import { TagBadgeProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Tag Badge ────────────────────────────────────────────────────────────────

export default function TagBadge({ tag, color = '#000' }: TagBadgeProps) {
  const meta = TAG_MAP[tag]
  const Icon = meta.icon

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Icon size={12} strokeWidth={3} color={color} />
      <Text style={[styles.label, { color }]}>{meta.label}</Text>
    </View>
  )
}

TagBadge.displayName = 'TagBadge'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1,
  },
})
