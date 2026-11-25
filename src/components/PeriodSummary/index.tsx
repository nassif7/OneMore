import { DeltaPill } from '@/components/StatsComparison'
import { formatRate, upperGap } from '@/helpers'
import { TPeriodStats } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Period Summary ───────────────────────────────────────────────────────────
// "4/DAY ↓20% · 1H 37M ↑15%": the period's daily average and gap, each with its change versus the
// previous period. Same numbers, delta pills and red "worse" rules as StatsComparison.

export default function PeriodSummary({ current, previous }: { current: TPeriodStats; previous: TPeriodStats | null }) {
  const rateAbove = previous !== null && current.dailyAvg > previous.dailyAvg
  const gapBelow =
    previous !== null &&
    current.avgGapMinutes !== null &&
    previous.avgGapMinutes !== null &&
    current.avgGapMinutes < previous.avgGapMinutes

  return (
    <View style={styles.row}>
      <Text style={[styles.value, rateAbove && styles.bad]}>{formatRate(current.dailyAvg)}</Text>
      {previous && <DeltaPill current={current.dailyAvg || null} previous={previous.dailyAvg || null} />}
      <Text style={styles.sep}>·</Text>
      <Text style={[styles.value, gapBelow && styles.bad]}>{upperGap(current.avgGapLabel)}</Text>
      {previous && <DeltaPill current={current.avgGapMinutes} previous={previous.avgGapMinutes} invert />}
    </View>
  )
}

PeriodSummary.displayName = 'PeriodSummary'

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 1, color: '#000' },
  bad: { color: '#C0392B' },
  sep: { fontFamily: 'BebasNeue', fontSize: 22, color: '#999' },
})
