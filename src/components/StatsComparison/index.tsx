import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
// ─── Delta Pill ───────────────────────────────────────────────────────────────

function DeltaPill({ current, previous, invert = false }: { current: number; previous: number; invert?: boolean }) {
  if (!previous) return null
  const delta = Math.round(((current - previous) / previous) * 100)
  if (delta === 0) return null
  const isGood = invert ? delta > 0 : delta < 0
  const arrow = delta > 0 ? '↑' : '↓'
  const sign = delta > 0 ? '+' : ''
  return (
    <View style={[styles.pill, { backgroundColor: isGood ? '#000' : '#C0392B' }]}>
      <Text style={styles.pillText}>{`${arrow} ${sign}${delta}%`}</Text>
    </View>
  )
}

// ─── Stat Cell ────────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  current,
  previous,
  invert,
  isAbove,
}: {
  label: string
  value: string
  current: number
  previous: number | null
  invert?: boolean
  isAbove?: boolean
}) {
  return (
    <View style={styles.cell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <View style={styles.cellValueRow}>
        <Text style={[styles.cellValue, isAbove && styles.cellValueAbove]}>{value}</Text>
        {previous !== null && <DeltaPill current={current} previous={previous} invert={invert} />}
      </View>
    </View>
  )
}

// ─── Stats Comparison ─────────────────────────────────────────────────────────

export default function StatsComparison({ current, previous, periodLabel }: IStatsComparisonProps) {
  const dailyAvgAbove = previous !== null && current.dailyAvg > previous.dailyAvg
  // for gap: being BELOW previous gap is bad (smoking more frequently)
  const avgGapAbove =
    previous !== null &&
    current.avgGapMinutes !== null &&
    previous.avgGapMinutes !== null &&
    current.avgGapMinutes < previous.avgGapMinutes

  return (
    <View style={styles.container}>
      <StatCell
        label={`${periodLabel} AVG`}
        value={current.dailyAvg > 0 ? `${current.dailyAvg} CIGS` : '—'}
        current={current.dailyAvg}
        previous={previous?.dailyAvg ?? null}
        isAbove={dailyAvgAbove}
      />
      <View style={styles.divider} />
      <StatCell
        label={`${periodLabel} GAP`}
        value={current.avgGapLabel}
        current={current.avgGapMinutes ?? 0}
        previous={previous?.avgGapMinutes ?? null}
        invert
        isAbove={avgGapAbove}
      />
    </View>
  )
}

StatsComparison.displayName = 'StatsComparison'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  divider: {
    width: 3,
    backgroundColor: '#000',
  },
  cellLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 2,
    color: '#555',
  },
  cellValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cellValue: {
    fontFamily: 'BebasNeue',
    fontSize: 22,
    color: '#000',
    letterSpacing: 1,
  },
  cellValueAbove: {
    color: '#C0392B',
  },
  pill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#000',
  },
  pillText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#fff',
    letterSpacing: 1,
  },
})
