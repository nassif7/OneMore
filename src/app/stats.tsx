import { BottomNav, ScreenHeader } from '@/components'
import MonthCalendar from '@/components/MonthCalendar'
import StatGrid, { TStatCell } from '@/components/StatGrid'
import StatsComparison from '@/components/StatsComparison'
import WeekBarChart from '@/components/WeekBarChart'
import useStatsData from '@/hooks/useStatsData'
import { router } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

type TView = 'WEEK' | 'MONTH'

export default function StatsScreen() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<TView>('WEEK')
  const {
    weekData,
    stats,
    currentWeekStats,
    prevWeekStats,
    weekLabel,
    monthData,
    allTimeDailyAvg,
    allTimeAvgGap,
    todayAvgGapMinutes,
    allTimeAvgGapMinutes,
    currentMonthStats,
    prevMonthStats,
  } = useStatsData(weekOffset)

  const statCells: TStatCell[] = useMemo(
    () => [
      {
        label: 'TODAY',
        value: stats.todayCount,
        unit: 'CIGS',
        bg: '#fff',
        isAbove: allTimeDailyAvg > 0 && stats.todayCount > allTimeDailyAvg,
      },
      {
        label: 'TODAY GAP',
        value: stats.avgGap,
        unit: 'BETWEEN',
        bg: '#fff',
        isAbove:
          todayAvgGapMinutes !== null && allTimeAvgGapMinutes !== null && todayAvgGapMinutes < allTimeAvgGapMinutes,
      },
      { label: 'DAILY AVG', value: allTimeDailyAvg, unit: 'CIGS/DAY', bg: '#F5F0E8' },
      { label: 'AVG GAP', value: allTimeAvgGap, unit: 'ALL TIME', bg: '#F5F0E8' },
    ],
    [stats, allTimeDailyAvg, allTimeAvgGap, todayAvgGapMinutes, allTimeAvgGapMinutes],
  )

  const handleDayPress = (dateStr: string) => {
    router.push({ pathname: '/history', params: { date: dateStr } })
  }

  return (
    <View style={styles.container}>
      <ScreenHeader showBack />

      <StatGrid stats={statCells} />

      {/* Toggle */}
      <View style={styles.toggle}>
        {(['WEEK', 'MONTH'] as TView[]).map((v) => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v)}
            style={[styles.toggleBtn, view === v && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, view === v && styles.toggleTextActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period stats — above chart, changes with view */}
      <StatsComparison
        current={view === 'WEEK' ? currentWeekStats : currentMonthStats}
        previous={view === 'WEEK' ? prevWeekStats : prevMonthStats}
        periodLabel={view === 'WEEK' ? 'THIS WEEK' : 'THIS MONTH'}
      />
      {/* Chart */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          {view === 'WEEK' ? (
            <WeekBarChart
              data={weekData}
              weekLabel={weekLabel}
              currentWeekStats={currentWeekStats}
              prevWeekStats={prevWeekStats}
              onPrevWeek={() => setWeekOffset((o) => o - 1)}
              onNextWeek={() => setWeekOffset((o) => o + 1)}
              canGoNext={weekOffset < 0}
              onDayPress={handleDayPress}
            />
          ) : (
            <MonthCalendar monthData={monthData} dailyAvg={stats.dailyAvg} />
          )}
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
  toggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 12,
    borderWidth: 3,
    borderColor: '#000',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  toggleBtnActive: {
    backgroundColor: '#000',
  },
  toggleText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    letterSpacing: 2,
    color: '#000',
  },
  toggleTextActive: {
    color: '#fff',
  },
})
