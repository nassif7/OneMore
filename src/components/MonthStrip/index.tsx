import { getMonthDots } from '@/helpers'
import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

// ─── Month Strip ──────────────────────────────────────────────────────────────
// One dot per day of the current month: filled = logged, hollow = nothing, red = today.

export default function MonthStrip({ monthData }: { monthData: Record<string, number> }) {
  const dots = useMemo(() => getMonthDots(monthData, new Date()), [monthData])
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {dots.map((d) => (
        <View
          key={d.day}
          style={[
            styles.dot,
            d.isFuture && styles.future,
            !d.isFuture && d.count === 0 && styles.empty,
            d.count > 0 && styles.filled,
            d.isToday && styles.today,
          ]}
        />
      ))}
    </View>
  )
}

MonthStrip.displayName = 'MonthStrip'

const DOT = 7

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 14 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  filled: { backgroundColor: '#000' },
  empty: { borderWidth: 1.5, borderColor: '#999' },
  future: { backgroundColor: '#e0dbd0' },
  today: { backgroundColor: '#C0392B', borderWidth: 0, width: DOT + 3, height: DOT + 3, borderRadius: (DOT + 3) / 2 },
})
