import { TDayBar } from '@/types'
import React from 'react'
import { StyleSheet, View } from 'react-native'

// ─── Week Sparkline ───────────────────────────────────────────────────────────
// Seven tiny bars, Mon–Sun, today in red. Days without entries get a hairline baseline.

const TRACK = 26

export default function WeekSparkline({ data }: { data: TDayBar[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {data.map((d, i) => (
        <View key={`${d.dateStr}-${i}`} style={styles.slot}>
          <View
            style={{
              width: '100%',
              height: d.count > 0 ? Math.max((d.count / max) * TRACK, 4) : 2,
              backgroundColor: d.isToday ? '#C0392B' : d.count > 0 ? '#000' : '#bbb',
            }}
          />
        </View>
      ))}
    </View>
  )
}

WeekSparkline.displayName = 'WeekSparkline'

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', height: TRACK, gap: 6 },
  slot: { flex: 1, height: TRACK, justifyContent: 'flex-end' },
})
