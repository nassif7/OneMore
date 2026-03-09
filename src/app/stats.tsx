import { BottomNav, ScreenHeader } from '@/components'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { getDay, getLast7Days } from '@/services/storage'
import { useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { AppState, ScrollView, StyleSheet, Text, View } from 'react-native'

interface IHomeScreenProps {
  navigation?: {
    navigate: (screen: string) => void
  }
}

type TDayBar = {
  label: string
  count: number
}

export default function StatsScreen({ navigation }: IHomeScreenProps) {
  const [todayTimes, setTodayTimes] = useState<number[]>([])
  const [weekData, setWeekData] = useState<TDayBar[]>([])
  const [weekTotal, setWeekTotal] = useState<number>(0)

  const loadData = useCallback(async () => {
    // Today
    const today = await getDay(new Date())
    setTodayTimes(today)

    // Last 7 days
    const last7 = await getLast7Days()
    const bars: TDayBar[] = Object.entries(last7)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, times]) => ({
        label: new Date(key).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 1),
        count: times.length,
      }))
    setWeekData(bars)
    setWeekTotal(bars.reduce((sum, d) => sum + d.count, 0))
  }, [])

  // Reload every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData()
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') loadData()
      })
      return () => sub.remove()
    }, [loadData]),
  )

  // Derived stats
  const todayCount = todayTimes.length
  const dailyAvg = weekData.length ? Math.round(weekTotal / weekData.length) : 0
  const packEquiv = (weekTotal / 20).toFixed(1)
  const avgGap = getAvgGap(todayTimes)
  const lastOne = getTimeSinceLast(todayTimes)
  const maxCount = Math.max(...weekData.map((d) => d.count), 1)

  const stats = [
    { label: 'TODAY', value: todayCount, unit: 'CIGS', bg: '#fff' },
    { label: 'THIS WEEK', value: weekTotal, unit: 'CIGS', bg: '#FF3B3B', color: '#fff' },
    { label: 'DAILY AVG', value: dailyAvg, unit: 'CIGS/DAY', bg: '#F5F0E8' },
    { label: 'PACK EQUIV', value: packEquiv, unit: 'PACKS/WK', bg: '#000', color: '#FF3B3B' },
    { label: 'AVG GAP', value: avgGap, unit: 'BETWEEN', bg: '#F5F0E8' },
    { label: 'LAST ONE', value: lastOne, unit: 'AGO', bg: '#fff' },
  ]

  return (
    <View style={styles.container}>
      <ScreenHeader title="STATS" showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stat grid */}
        <View style={styles.grid}>
          {stats.map((s, i) => (
            <View
              key={i}
              style={[
                styles.statCell,
                { backgroundColor: s.bg },
                i % 2 === 0 && { borderRightWidth: 3 },
                i < stats.length - 2 && { borderBottomWidth: 3 },
              ]}
            >
              <Text style={[styles.statLabel, { color: s.color || '#666' }]}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color || '#000' }]}>{s.value}</Text>
              <Text style={[styles.statUnit, { color: s.color || '#999' }]}>{s.unit}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>LAST 7 DAYS</Text>
          <View style={styles.chart}>
            {weekData.map((d, i) => {
              const isToday = i === weekData.length - 1
              const barH = maxCount > 0 ? (d.count / maxCount) * 100 : 0
              return (
                <View key={i} style={styles.barWrapper}>
                  {/* Count label on top */}
                  {d.count > 0 && (
                    <Text style={[styles.barCount, { color: isToday ? '#FF3B3B' : '#000' }]}>{d.count}</Text>
                  )}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barH,
                          backgroundColor: isToday ? '#FF3B3B' : '#000',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{d.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Nudge preview */}
        <View style={styles.nudgeBox}>
          <Text style={styles.nudgeLabel}>🔔 NEXT NUDGE IN 2H</Text>
          <Text style={styles.nudgeText}>"FEELING THAT ITCH?"</Text>
        </View>
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

  // Header
  header: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    backgroundColor: '#F5F0E8',
  },
  backButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#000',
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: 2,
    color: '#000',
  },

  // Stat grid
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  statCell: {
    width: '50%',
    padding: 20,
    borderColor: '#000',
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  statValue: {
    fontFamily: 'BebasNeue',
    fontSize: 44,
    lineHeight: 44,
  },
  statUnit: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    marginTop: 2,
  },

  // Bar chart
  chartContainer: {
    padding: 20,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  chartTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#000',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 120,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: 120,
    justifyContent: 'flex-end',
  },
  barCount: {
    fontFamily: 'BebasNeue',
    fontSize: 12,
    marginBottom: 2,
  },
  barTrack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#000',
    minHeight: 4,
  },
  barLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#000',
    marginTop: 4,
  },

  // Nudge box
  nudgeBox: {
    margin: 20,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  nudgeLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 2,
    color: '#555',
    marginBottom: 8,
  },
  nudgeText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    letterSpacing: 2,
    color: '#000',
  },
})
