import { BottomNav, ScreenHeader } from '@/components'
import CalendarSheet from '@/components/CalendarSheet'
import DayNavigator from '@/components/DayNavigator'
import LogRow from '@/components/LogRow'
import TimePickerSheet from '@/components/TimePickerSheet'
import { toCalendarDateString } from '@/helpers'
import useHistoryData from '@/hooks/useHistoryData'
import { computePattern } from '@/services/patternCalculator'
import { formatTime } from '@/services/stats'
import { deleteLog, editLog } from '@/services/storage'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function HistoryScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>()
  const initialDate = date ? new Date(date) : undefined

  const { entry, selectedDate, isToday, goToPrevDay, goToNextDay, goToDate, reload } = useHistoryData(initialDate)

  // rest of the screen unchanged
  const [calendarVisible, setCalendarVisible] = useState<boolean>(false)
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [editingTs, setEditingTs] = useState<number | null>(null)
  const [editTime, setEditTime] = useState<Date>(new Date())

  const times = useMemo(() => (entry?.times ? [...entry.times].reverse() : []), [entry?.times])
  const dateStr = toCalendarDateString(selectedDate)

  useEffect(() => {
    computePattern().then((p) => setAvgGapMs(p.avgGapMs))
  }, [entry])

  const handleDelete = (ts: number) => {
    Alert.alert('DELETE LOG', `Remove the ${formatTime(ts)} log?`, [
      { text: 'CANCEL', style: 'cancel' },
      {
        text: 'DELETE',
        style: 'destructive',
        onPress: async () => {
          await deleteLog(selectedDate, ts)
          reload()
        },
      },
    ])
  }

  const handleEditOpen = (ts: number) => {
    setEditingTs(ts)
    setEditTime(new Date(ts))
  }

  const handleEditSave = async () => {
    if (editingTs === null) return
    await editLog(selectedDate, editingTs, editTime.getTime())
    setEditingTs(null)
    reload()
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack />
      <DayNavigator
        label={entry?.label ?? ''}
        fullDate={entry?.fullDate ?? ''}
        isToday={isToday}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        onCalendar={() => setCalendarVisible(true)}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {times.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>CLEAN DAY.</Text>
            <Text style={styles.emptySubtitle}>nothing logged.</Text>
          </View>
        )}
        {times.map((ts, i) => {
          const prevTs = times[i + 1] ?? null
          const gapMs = prevTs !== null ? ts - prevTs : null
          return (
            <LogRow
              key={ts}
              index={times.length - i}
              timestamp={ts}
              time={formatTime(ts)}
              gapMs={gapMs}
              avgGapMs={avgGapMs}
              onEdit={handleEditOpen}
              onDelete={handleDelete}
            />
          )
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
      <TimePickerSheet
        visible={editingTs !== null}
        value={editTime}
        onChange={setEditTime}
        onSave={handleEditSave}
        onClose={() => setEditingTs(null)}
      />
      <CalendarSheet
        visible={calendarVisible}
        selectedDateStr={dateStr}
        onDayPress={(dateString) => {
          goToDate(new Date(dateString))
          setCalendarVisible(false)
        }}
        onClose={() => setCalendarVisible(false)}
      />
      <BottomNav />
    </View>
  )
}

HistoryScreen.displayName = 'HistoryScreen'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  emptyState: { padding: 40, alignItems: 'center', gap: 8 },
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
