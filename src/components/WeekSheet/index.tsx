import BottomSheet from '@/components/BottomSheet'
import StatsComparison from '@/components/StatsComparison'
import WeekBarChart from '@/components/WeekBarChart'
import { weekOfLabel } from '@/helpers'
import useStatsData from '@/hooks/useStatsData'
import React, { useState } from 'react'

// ─── Week Sheet ───────────────────────────────────────────────────────────────
// The body owns the week offset and its own stats load. The Modal only mounts children while
// visible, so nothing loads when closed and every open starts on the current week. On the current
// week the sheet title already says "THIS WEEK", so the stats and chart headers stay unlabelled.

function WeekSheetBody({ onDayPress }: { onDayPress: (dateStr: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const { weekData, weekLabel, currentWeekStats, prevWeekStats } = useStatsData(weekOffset)
  const periodLabel = weekOffset === 0 || weekData.length === 0 ? '' : weekOfLabel(weekData[0].dateStr)

  return (
    <>
      <StatsComparison current={currentWeekStats} previous={prevWeekStats} periodLabel={periodLabel} />
      <WeekBarChart
        data={weekData}
        weekLabel={weekOffset === 0 ? '' : weekLabel}
        currentWeekStats={currentWeekStats}
        prevWeekStats={prevWeekStats}
        onPrevWeek={() => setWeekOffset((o) => o - 1)}
        onNextWeek={() => setWeekOffset((o) => o + 1)}
        canGoNext={weekOffset < 0}
        onDayPress={onDayPress}
      />
    </>
  )
}

export default function WeekSheet({
  visible,
  onClose,
  onDayPress,
}: {
  visible: boolean
  onClose: () => void
  onDayPress: (dateStr: string) => void
}) {
  return (
    <BottomSheet visible={visible} title="THIS WEEK" onClose={onClose}>
      <WeekSheetBody onDayPress={onDayPress} />
    </BottomSheet>
  )
}

WeekSheet.displayName = 'WeekSheet'
