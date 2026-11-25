import { TAG_MAP } from '@/constants/tags'
import { getTopTags } from '@/helpers'
import { TTagCount } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Triggers Preview ─────────────────────────────────────────────────────────
// Top 3 tags in one compact row: icon, name, count. The most-used one is red, like the full list.

export default function TriggersPreview({ data }: { data: TTagCount[] }) {
  const top = getTopTags(data, 3)
  if (top.length === 0) return <Text style={styles.empty}>NO TRIGGERS YET.</Text>
  return (
    <View style={styles.row}>
      {top.map((t, i) => {
        const meta = TAG_MAP[t.tag]
        const Icon = meta.icon
        const color = i === 0 ? '#C0392B' : '#000'
        return (
          <View key={t.tag} style={styles.item}>
            <Icon size={16} strokeWidth={3} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {meta.label}
            </Text>
            <Text style={[styles.count, { color }]}>{t.count}</Text>
          </View>
        )
      })}
    </View>
  )
}

TriggersPreview.displayName = 'TriggersPreview'

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  item: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  label: { flexShrink: 1, fontFamily: 'BebasNeue', fontSize: 14, letterSpacing: 0.5 },
  count: { fontFamily: 'BebasNeue', fontSize: 16 },
  empty: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1, color: '#999' },
})
