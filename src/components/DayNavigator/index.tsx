import { DayNavigatorProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Day Navigator ────────────────────────────────────────────────────────────

export default function DayNavigator({ label, fullDate, isToday, onPrev, onNext, onCalendar }: DayNavigatorProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrowButton}>
        <Text style={styles.arrowText}>{'←'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCalendar} style={styles.dateButton}>
        <Text style={styles.dateLabel}>{isToday ? 'TODAY' : label}</Text>
        <Text style={styles.dateFullDate}>{fullDate}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        style={[styles.arrowButton, isToday && styles.arrowButtonDisabled]}
        disabled={isToday}
      >
        <Text style={[styles.arrowText, isToday && styles.arrowTextDisabled]}>{'→'}</Text>
      </TouchableOpacity>
    </View>
  )
}

DayNavigator.displayName = 'DayNavigator'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  arrowButton: {
    width: 56,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.2,
  },
  arrowText: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    color: '#000',
  },
  arrowTextDisabled: {
    color: '#999',
  },
  dateButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
  },
  dateLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: '#000',
    lineHeight: 28,
  },
  dateFullDate: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#666',
    letterSpacing: 1,
    marginTop: 2,
  },
})
