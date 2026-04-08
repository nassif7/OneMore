import { formatGap, getGapColor } from '@/helpers'
import { LogRowProps } from '@/types'
import { Edit2, Trash } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Log Row ──────────────────────────────────────────────────────────────────

export default function LogRow({ index, timestamp, time, gapMs, avgGapMs, onEdit, onDelete }: LogRowProps) {
  const ratio = gapMs !== null && avgGapMs !== null && gapMs > 0 ? gapMs / avgGapMs : null

  const color = getGapColor(ratio)

  const isColored = color !== '#F5F0E8'
  const textColor = isColored ? '#fff' : '#000'
  const subTextColor = isColored ? '#fff' : '#666'
  const indexColor = isColored ? '#fff' : '#999'

  return (
    <View style={[styles.container, { backgroundColor: color }]}>
      {/* Index */}
      <Text style={[styles.index, { color: indexColor }]}>#{index}</Text>

      {/* Time + gap */}
      <View style={styles.main}>
        <Text style={[styles.time, { color: textColor }]}>{time}</Text>
        {gapMs !== null && <Text style={[styles.gap, { color: subTextColor }]}>+{formatGap(gapMs)} since last</Text>}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(timestamp)}
          style={styles.actionButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Edit2 size={20} color={textColor} strokeWidth={3} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(timestamp)}
          style={styles.actionButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash size={20} color={textColor} strokeWidth={3} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

LogRow.displayName = 'LogRow'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    borderColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  index: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1,
    width: 24,
  },
  main: {
    flex: 1,
    gap: 2,
  },
  time: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    lineHeight: 28,
  },
  gap: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
