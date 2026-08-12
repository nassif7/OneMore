import { BottomNav, ConfirmModal, ScreenHeader } from '@/components'
import { Plus } from 'lucide-react-native'
import CalendarSheet from '@/components/CalendarSheet'
import DayNavigator from '@/components/DayNavigator'
import LogRow from '@/components/LogRow'
import TimePickerSheet from '@/components/TimePickerSheet'
import { toCalendarDateString } from '@/helpers'
import useHistoryData from '@/hooks/useHistoryData'
import useTagsEnabled from '@/hooks/useTagsEnabled'
import { computePattern } from '@/services/patternCalculator'
import { formatTime } from '@/services/stats'
import { addLog, deleteLog, editLog, setTag } from '@/services/storage'
import { TagId, TLogEntry } from '@/types'
import { router } from 'expo-router'
import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function HistoryScreen() {
  const { date } = useLocalSearchParams<{ date?: string }>()
  const initialDate = date ? new Date(date) : undefined

  const { entry, selectedDate, isToday, goToPrevDay, goToNextDay, goToDate, reload } = useHistoryData(initialDate)
  const { enabled: tagsEnabled } = useTagsEnabled()

  const [calendarVisible, setCalendarVisible] = useState<boolean>(false)
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [editingEntry, setEditingEntry] = useState<TLogEntry | null>(null)
  const [editTime, setEditTime] = useState<Date>(new Date())
  const [editTag, setEditTag] = useState<TagId | undefined>(undefined)
  const [deletingEntry, setDeletingEntry] = useState<TLogEntry | null>(null)
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [addTime, setAddTime] = useState<Date>(new Date())
  const [addTag, setAddTag] = useState<TagId | undefined>(undefined)

  const entries = useMemo(() => (entry?.entries ? [...entry.entries].reverse() : []), [entry?.entries])
  const dateStr = toCalendarDateString(selectedDate)

  useEffect(() => {
    computePattern()
      .then((p) => setAvgGapMs(p.avgGapMs))
      .catch((error) => console.error('[HistoryScreen] Failed to load pattern:', error))
  }, [entry])

  const handleAddOpen = () => {
    setAddTime(new Date(selectedDate))
    setAddTag(undefined)
    setIsAdding(true)
  }

  const handleAddSave = async () => {
    try {
      await addLog(selectedDate, addTime.getTime(), addTag)
      setIsAdding(false)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to add log:', error)
      Alert.alert('ERROR', 'Failed to add. Please try again.')
      setIsAdding(false)
    }
  }

  const handleDelete = (id: string) => setDeletingEntry(entries.find((e) => e.id === id) ?? null)

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return
    try {
      await deleteLog(selectedDate, deletingEntry.id)
      setDeletingEntry(null)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to delete log:', error)
      Alert.alert('ERROR', 'Failed to delete. Please try again.')
      setDeletingEntry(null)
    }
  }

  const handleEditOpen = (id: string) => {
    const found = entries.find((e) => e.id === id)
    if (!found) return
    setEditingEntry(found)
    setEditTime(new Date(found.ts))
    setEditTag(found.tag)
  }

  const handleEditSave = async () => {
    if (!editingEntry) return
    try {
      await editLog(selectedDate, editingEntry.id, editTime.getTime())
      if (editTag !== editingEntry.tag) await setTag(selectedDate, editingEntry.id, editTag)
      setEditingEntry(null)
      reload()
    } catch (error) {
      console.error('[HistoryScreen] Failed to edit log:', error)
      Alert.alert('ERROR', 'Failed to save. Please try again.')
      setEditingEntry(null)
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
        {entries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>CLEAN DAY.</Text>
            <Text style={styles.emptySubtitle}>nothing logged.</Text>
          </View>
        )}
        {entries.map((e, i) => {
          const prevEntry = entries[i + 1] ?? null
          const gapMs = prevEntry ? e.ts - prevEntry.ts : null
          return (
            <LogRow
              key={e.id}
              id={e.id}
              index={entries.length - i}
              time={formatTime(e.ts)}
              tag={tagsEnabled ? e.tag : undefined}
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
        visible={editingEntry !== null}
        value={editTime}
        onChange={setEditTime}
        tag={editTag}
        onTagChange={setEditTag}
        tagsEnabled={tagsEnabled}
        onSave={handleEditSave}
        onClose={() => setEditingEntry(null)}
      />
      <TimePickerSheet
        visible={isAdding}
        value={addTime}
        onChange={setAddTime}
        tag={addTag}
        onTagChange={setAddTag}
        tagsEnabled={tagsEnabled}
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
        visible={deletingEntry !== null}
        title="DELETE CIG?"
        body={`Remove the ${deletingEntry ? formatTime(deletingEntry.ts) : ''} cig?`}
        confirmLabel="DELETE"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingEntry(null)}
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
