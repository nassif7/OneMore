import { BottomNav, ScreenHeader } from '@/components'
import StatGrid, { TStatCell } from '@/components/StatGrid'
import WeekBarChart from '@/components/WeekBarChart'
import useStatsData from '@/hooks/useStatsData'
import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

export default function StatsScreen() {
  const { weekData, stats } = useStatsData()

  const statCells: TStatCell[] = [
    { label: 'TODAY', value: stats.todayCount, unit: 'CIGS', bg: '#fff' },
    { label: 'THIS WEEK', value: stats.weekTotal, unit: 'CIGS', bg: '#FF3B3B', color: '#fff' },
    { label: 'DAILY AVG', value: stats.dailyAvg, unit: 'CIGS/DAY', bg: '#F5F0E8' },
    { label: 'PACK EQUIV', value: stats.packEquiv, unit: 'PACKS/WK', bg: '#000', color: '#FF3B3B' },
    { label: 'AVG GAP', value: stats.avgGap, unit: 'BETWEEN', bg: '#F5F0E8' },
    { label: 'LAST ONE', value: stats.lastOne, unit: 'AGO', bg: '#fff' },
  ]

  return (
    <View style={styles.container}>
      <ScreenHeader showBack />

      <ScrollView showsVerticalScrollIndicator={false}>
        <StatGrid stats={statCells} />
        <WeekBarChart data={weekData} />

        {/* Nudge preview — temporary until real notification data is wired */}
        <View style={styles.nudgeBox}>
          <Text style={styles.nudgeLabel}>🔔 NEXT NUDGE IN 2H</Text>
          <Text style={styles.nudgeText}>"FEELING THAT ITCH?"</Text>
        </View>
      </ScrollView>

      <BottomNav />
    </View>
  )
}

StatsScreen.displayName = 'StatsScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
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
