import { TAG_MAP } from '@/constants/tags'
import { TagBreakdownProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Tag Breakdown ────────────────────────────────────────────────────────────

export default function TagBreakdown({ data }: TagBreakdownProps) {
  const tagged = data.filter((d) => d.count > 0)
  const maxCount = Math.max(...tagged.map((d) => d.count), 1)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WHEN DO YOU SMOKE?</Text>
      {tagged.length === 0 ? (
        <Text style={styles.emptyText}>NO MOOD DATA YET.</Text>
      ) : (
        <View style={styles.list}>
          {tagged.map((d, i) => {
            const meta = TAG_MAP[d.tag]
            const Icon = meta.icon
            const isTop = i === 0
            const accent = isTop ? '#C0392B' : '#000'
            const barWidth = (d.count / maxCount) * 100

            return (
              <View key={d.tag} style={styles.row}>
                <Icon size={20} strokeWidth={3} color={accent} />
                <View style={styles.rowMain}>
                  <View style={styles.rowHeader}>
                    <Text style={[styles.label, { color: accent }]}>{meta.label}</Text>
                    <Text style={[styles.count, { color: accent }]}>{d.count}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { width: `${barWidth}%`, backgroundColor: accent }]} />
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
    </View>
  )
}

TagBreakdown.displayName = 'TagBreakdown'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#000',
    marginBottom: 16,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 1,
    color: '#999',
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'BebasNeue',
    fontSize: 16,
    letterSpacing: 1,
  },
  count: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
  },
  barTrack: {
    height: 8,
    backgroundColor: '#e0dbd0',
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
})
