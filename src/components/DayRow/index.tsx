import { formatTime, getAvgGap } from '@/services/stats'
import { DayRowProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Day Row ──────────────────────────────────────────────────────────────────

export default function DayRow({ day, isToday, maxCount, onPress }: DayRowProps) {
  const count = day.times.length
  const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
  const avgGap = getAvgGap(day.times)

  return (
    <TouchableOpacity
      onPress={() => onPress(day)}
      activeOpacity={0.8}
      style={[styles.container, isToday && styles.containerToday]}
    >
      {/* Day header row */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{isToday ? 'TODAY' : day.label}</Text>
          <Text style={[styles.dayDate, isToday && styles.dayDateToday]}>{day.fullDate}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.dayCount, isToday && styles.dayCountToday]}>{count}</Text>
          <Text style={[styles.dayUnit, isToday && styles.dayUnitToday]}>CIGS</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.barTrack, isToday && styles.barTrackToday]}>
        <View
          style={[
            styles.bar,
            {
              width: `${barWidth}%`,
              backgroundColor: isToday ? '#fff' : '#000',
            },
          ]}
        />
      </View>

      {/* Stats row */}
      {count > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={[styles.statPillLabel, isToday && styles.statPillLabelToday]}>AVG GAP</Text>
            <Text style={[styles.statPillValue, isToday && styles.statPillValueToday]}>{avgGap}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={[styles.statPillLabel, isToday && styles.statPillLabelToday]}>FIRST</Text>
            <Text style={[styles.statPillValue, isToday && styles.statPillValueToday]}>{formatTime(day.times[0])}</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={[styles.statPillLabel, isToday && styles.statPillLabelToday]}>LAST</Text>
            <Text style={[styles.statPillValue, isToday && styles.statPillValueToday]}>
              {formatTime(day.times[day.times.length - 1])}
            </Text>
          </View>
        </View>
      )}

      {count === 0 && <Text style={styles.zeroDay}>— CLEAN DAY —</Text>}
    </TouchableOpacity>
  )
}

DayRow.displayName = 'DayRow'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 3,
    borderColor: '#000',
    padding: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  containerToday: {
    backgroundColor: '#FF4500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dayLabel: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
    color: '#000',
    lineHeight: 28,
  },
  dayLabelToday: {
    color: '#fff',
  },
  dayDate: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    marginTop: 2,
  },
  dayDateToday: {
    color: 'rgba(255,255,255,0.6)',
  },
  dayCount: {
    fontFamily: 'BebasNeue',
    fontSize: 52,
    lineHeight: 52,
    color: '#000',
    letterSpacing: -1,
  },
  dayCountToday: {
    color: '#fff',
  },
  dayUnit: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#666',
    letterSpacing: 2,
    textAlign: 'right',
  },
  dayUnitToday: {
    color: 'rgba(255,255,255,0.6)',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#e0dbd0',
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
  },
  barTrackToday: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },
  bar: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statPill: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#000',
    padding: 8,
    gap: 2,
  },
  statPillLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    letterSpacing: 1,
    color: '#666',
  },
  statPillLabelToday: {
    color: 'rgba(255,255,255,0.6)',
  },
  statPillValue: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  statPillValueToday: {
    color: '#fff',
  },
  zeroDay: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 4,
  },
})
