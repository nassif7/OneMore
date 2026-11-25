import { BottomNav, ScreenHeader, StatsComparison, TagBreakdown } from '@/components'
import BottomSheet from '@/components/BottomSheet'
import MonthCalendar from '@/components/MonthCalendar'
import MonthStrip from '@/components/MonthStrip'
import PeriodSummary from '@/components/PeriodSummary'
import StatGrid from '@/components/StatGrid'
import StatsCard from '@/components/StatsCard'
import TriggersPreview from '@/components/TriggersPreview'
import WeekSheet from '@/components/WeekSheet'
import WeekSparkline from '@/components/WeekSparkline'
import { TAG_MAP } from '@/constants/tags'
import { getTopTags, upperGap } from '@/helpers'
import useStatsData from '@/hooks/useStatsData'
import useTagsEnabled from '@/hooks/useTagsEnabled'
import { TStatCell } from '@/types'
import { router, useFocusEffect } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

type TSheet = 'WEEK' | 'MONTH' | 'TRIGGERS' | null

export default function StatsScreen() {
  const [sheet, setSheet] = useState<TSheet>(null)
  const { enabled: tagsEnabled } = useTagsEnabled()
  const {
    weekData,
    stats,
    currentWeekStats,
    prevWeekStats,
    monthData,
    allTimeDailyAvg,
    allTimeAvgGap,
    todayAvgGapMinutes,
    allTimeAvgGapMinutes,
    currentMonthStats,
    prevMonthStats,
    tagBreakdown,
  } = useStatsData(0)

  // Sheets are modals over this screen; close them when navigating away (e.g. to a day in History).
  useFocusEffect(useCallback(() => () => setSheet(null), []))

  const closeSheet = () => setSheet(null)

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
        value: upperGap(stats.avgGap),
        unit: 'BETWEEN',
        bg: '#fff',
        isAbove:
          todayAvgGapMinutes !== null && allTimeAvgGapMinutes !== null && todayAvgGapMinutes < allTimeAvgGapMinutes,
      },
      { label: 'DAILY AVG', value: allTimeDailyAvg, unit: 'CIGS/DAY', bg: '#F5F0E8' },
      { label: 'AVG GAP', value: upperGap(allTimeAvgGap), unit: 'ALL TIME', bg: '#F5F0E8' },
    ],
    [stats, allTimeDailyAvg, allTimeAvgGap, todayAvgGapMinutes, allTimeAvgGapMinutes],
  )

  const periodLabel = (name: string, dailyAvg: number) =>
    dailyAvg > 0 ? `${name}, ${dailyAvg} cigarettes per day, open details` : `${name}, no data yet, open details`

  const topTags = getTopTags(tagBreakdown, 3)
  const triggersLabel =
    topTags.length > 0
      ? `Triggers, top: ${topTags.map((t) => `${TAG_MAP[t.tag].label.toLowerCase()} ${t.count}`).join(', ')}, open details`
      : 'Triggers, no data yet, open details'

  return (
    <View style={styles.container}>
      <ScreenHeader showBack onAbout={() => router.push('/about')} />

      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <StatGrid stats={statCells} compact />

        <StatsCard
          title="THIS WEEK"
          accessibilityLabel={periodLabel('This week', currentWeekStats.dailyAvg)}
          onPress={() => setSheet('WEEK')}
        >
          <PeriodSummary current={currentWeekStats} previous={prevWeekStats} />
          <WeekSparkline data={weekData} />
        </StatsCard>

        <StatsCard
          title="THIS MONTH"
          accessibilityLabel={periodLabel('This month', currentMonthStats.dailyAvg)}
          onPress={() => setSheet('MONTH')}
        >
          <PeriodSummary current={currentMonthStats} previous={prevMonthStats} />
          <MonthStrip monthData={monthData} />
        </StatsCard>

        {tagsEnabled && (
          <StatsCard title="TRIGGERS" accessibilityLabel={triggersLabel} onPress={() => setSheet('TRIGGERS')}>
            <TriggersPreview data={tagBreakdown} />
          </StatsCard>
        )}
      </ScrollView>

      <BottomNav />

      <WeekSheet
        visible={sheet === 'WEEK'}
        onClose={closeSheet}
        onDayPress={(dateStr) => router.push({ pathname: '/history', params: { date: dateStr } })}
      />

      <BottomSheet visible={sheet === 'MONTH'} title="THIS MONTH" onClose={closeSheet}>
        <StatsComparison current={currentMonthStats} previous={prevMonthStats} periodLabel="THIS MONTH" />
        <View style={styles.sheetBody}>
          <MonthCalendar monthData={monthData} dailyAvg={currentMonthStats.dailyAvg} />
        </View>
      </BottomSheet>

      <BottomSheet visible={sheet === 'TRIGGERS'} title="TRIGGERS" onClose={closeSheet}>
        <TagBreakdown data={tagBreakdown} />
      </BottomSheet>
    </View>
  )
}

StatsScreen.displayName = 'StatsScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  content: {
    paddingBottom: 12,
  },
  sheetBody: {
    padding: 20,
  },
})
