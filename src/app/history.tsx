import { BottomNav, ScreenHeader } from '@/components'
import { formatTime, getAvgGap } from '@/services/stats'
import { getLast7Days } from '@/services/storage'

import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayEntry {
  key: string
  label: string
  fullDate: string
  times: number[]
}

// ─── History Screen ───────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const [days, setDays] = useState<DayEntry[]>([])

  const loadData = useCallback(async () => {
    const last7 = await getLast7Days()

    const entries: DayEntry[] = Object.entries(last7)
      .sort(([a], [b]) => b.localeCompare(a)) // most recent first
      .map(([key, times]) => {
        const date = new Date(key)
        return {
          key,
          label: date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
          fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
          times,
        }
      })

    setDays(entries)
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  const maxCount = Math.max(...days.map((d) => d.times.length), 1)

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="HISTORY" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {days.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>NOTHING YET.</Text>
            <Text style={styles.emptySubtitle}>go light one up.</Text>
          </View>
        )}

        {days.map((day, i) => {
          const isToday = i === 0
          const avgGap = getAvgGap(day.times)
          const count = day.times.length
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <View key={day.key} style={[styles.dayBlock, isToday && styles.dayBlockToday]}>
              {/* Day header row */}
              <View style={styles.dayHeader}>
                <View>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    {isToday ? 'TODAY' : day.label}
                  </Text>
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
                    <Text style={[styles.statPillValue, isToday && styles.statPillValueToday]}>
                      {formatTime(day.times[0])}
                    </Text>
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
            </View>
          )
        })}

        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },

  // Empty state
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

  // Day block
  dayBlock: {
    borderBottomWidth: 3,
    borderColor: '#000',
    padding: 20,
    backgroundColor: '#fff',
    gap: 12,
  },
  dayBlockToday: {
    backgroundColor: '#FF3B3B',
  },

  // Day header
  dayHeader: {
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

  // Bar
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

  // Stats row
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

  // Zero day
  zeroDay: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 4,
  },
})
