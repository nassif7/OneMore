import { BottomNav, ConfirmModal, ScreenHeader } from '@/components'
import { Plus } from 'lucide-react-native'
import CalendarSheet from '@/components/CalendarSheet'
import DayNavigator from '@/components/DayNavigator'
import LogRow from '@/components/LogRow'
import TimePickerSheet from '@/components/TimePickerSheet'
import { toCalendarDateString } from '@/helpers'
import useHistoryData from '@/hooks/useHistoryData'
import { computePattern } from '@/services/patternCalculator'
import { formatTime } from '@/services/stats'
import { addLog, deleteLog, editLog } from '@/services/storage'
import { router } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function HistoryScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>()
  const initialDate = date ? new Date(date) : undefined

  const { entry, selectedDate, isToday, goToPrevDay, goToNextDay, goToDate, reload } = useHistoryData(initialDate)

  const [calendarVisible, setCalendarVisible] = useState<boolean>(false)
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [editingTs, setEditingTs] = useState<number | null>(null)
  const [editTime, setEditTime] = useState<Date>(new Date())
  const [deletingTs, setDeletingTs] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [addTime, setAddTime] = useState<Date>(new Date())

  const times = useMemo(() => (entry?.times ? [...entry.times].reverse() : []), [entry?.times])
  const dateStr = toCalendarDateString(selectedDate)

  useEffect(() => {
    computePattern()
      .then((p) => setAvgGapMs(p.avgGapMs))
      .catch((error) => console.error('[HistoryScreen] Failed to load pattern:', error))
  }, [entry])

  const handleAddOpen = () => {
    setAddTime(new Date(selectedDate))
    setIsAdding(true)
  }

  const handleAddSave = async () => {
    try {
      await addLog(selectedDate, addTime.getTime())
      setIsAdding(false)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to add log:', error)
      Alert.alert('ERROR', 'Failed to add. Please try again.')
      setIsAdding(false)
    }
  }

  const handleDelete = (ts: number) => setDeletingTs(ts)

  const handleDeleteConfirm = async () => {
    if (deletingTs === null) return
    try {
      await deleteLog(selectedDate, deletingTs)
      setDeletingTs(null)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to delete log:', error)
      Alert.alert('ERROR', 'Failed to delete. Please try again.')
      setDeletingTs(null)
    }
  }

  const handleEditOpen = (ts: number) => {
    setEditingTs(ts)
    setEditTime(new Date(ts))
  }

  const handleEditSave = async () => {
    if (editingTs === null) return
    try {
      await editLog(selectedDate, editingTs, editTime.getTime())
      setEditingTs(null)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to edit log:', error)
      Alert.alert('ERROR', 'Failed to save. Please try again.')
      setEditingTs(null)
    }
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack onAbout={() => router.push('/about')} />
      <DayNavigator
        label={entry?.label ?? ''}
        fullDate={entry?.fullDate ?? ''}
        isToday={isToday}
        onPrev={goToPrevDay}
        onNext={goToNextDay}
        onCalendar={() => setCalendarVisible(true)}
      />
      <TouchableOpacity onPress={handleAddOpen} style={styles.addRow}>
        <Plus size={16} color="#000" strokeWidth={3} />
        <Text style={styles.addRowLabel}>ADD CIG</Text>
      </TouchableOpacity>
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
      <TimePickerSheet
        visible={isAdding}
        value={addTime}
        onChange={setAddTime}
        onSave={handleAddSave}
        onClose={() => setIsAdding(false)}
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
      <ConfirmModal
        visible={deletingTs !== null}
        title="DELETE LOG?"
        body={`Remove the ${deletingTs ? formatTime(deletingTs) : ''} log?`}
        confirmLabel="DELETE"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTs(null)}
      />
      <BottomNav />
    </View>
  )
}

HistoryScreen.displayName = 'HistoryScreen'

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E8' },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  addRowLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 2,
    color: '#000',
  },
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
