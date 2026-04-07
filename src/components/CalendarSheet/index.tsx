import { CalendarSheetProps } from '@/types'
import React from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Calendar } from 'react-native-calendars'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const todayDateStr = (): string => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─── Calendar Sheet ───────────────────────────────────────────────────────────

export default function CalendarSheet({ visible, selectedDateStr, onDayPress, onClose }: CalendarSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Calendar
          current={selectedDateStr}
          maxDate={todayDateStr()}
          onDayPress={(day) => onDayPress(day.dateString)}
          markedDates={{
            [selectedDateStr]: { selected: true, selectedColor: '#FF4500' },
          }}
          theme={{
            backgroundColor: '#F5F0E8',
            calendarBackground: '#F5F0E8',
            textSectionTitleColor: '#000',
            selectedDayBackgroundColor: '#FF4500',
            selectedDayTextColor: '#fff',
            todayTextColor: '#FF4500',
            dayTextColor: '#000',
            textDisabledColor: '#ccc',
            arrowColor: '#000',
            monthTextColor: '#000',
            textDayFontFamily: 'SpaceMono',
            textMonthFontFamily: 'BebasNeue',
            textDayHeaderFontFamily: 'SpaceMono',
            textDayFontSize: 13,
            textMonthFontSize: 24,
            textDayHeaderFontSize: 10,
          }}
        />
      </View>
    </Modal>
  )
}

CalendarSheet.displayName = 'CalendarSheet'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#F5F0E8',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 12,
    paddingBottom: 32,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginBottom: 16,
  },
})
