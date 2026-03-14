import { BottomNav, ScreenHeader } from '@/components'
import DayDetail from '@/components/DayDetail'
import DayRow from '@/components/DayRow'
import useHistoryData, { TDayEntry } from '@/hooks/useHistoryData'
import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

// ─── History Screen ───────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { days, maxCount } = useHistoryData()
  const [selected, setSelected] = useState<TDayEntry | null>(null)

  return (
    <View style={styles.container}>
      <ScreenHeader showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {days.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NOTHING YET.</Text>
            <Text style={styles.emptySubtitle}>go light one up.</Text>
          </View>
        )}

        {days.map((day, i) => (
          <DayRow key={day.key} day={day} isToday={i === 0} maxCount={maxCount} onPress={setSelected} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      <DayDetail day={selected} onClose={() => setSelected(null)} />

      <BottomNav />
    </View>
  )
}

HistoryScreen.displayName = 'HistoryScreen'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 36,
    letterSpacing: 3,
    color: '#000',
  },
  emptySubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#666',
    letterSpacing: 2,
  },
})
