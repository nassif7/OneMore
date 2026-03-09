import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TStatCell = {
  label: string
  value: string | number
  unit: string
  bg: string
  color?: string
}

interface IStatGridProps {
  stats: TStatCell[]
}

export default function StatGrid({ stats }: IStatGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((s, i) => (
        <View
          key={s.label}
          style={[
            styles.cell,
            { backgroundColor: s.bg },
            i % 2 === 0 && styles.cellBorderRight,
            i < stats.length - 2 && styles.cellBorderBottom,
          ]}
        >
          <Text style={[styles.label, { color: s.color || '#666' }]}>{s.label}</Text>
          <Text style={[styles.value, { color: s.color || '#000' }]}>{s.value}</Text>
          <Text style={[styles.unit, { color: s.color || '#999' }]}>{s.unit}</Text>
        </View>
      ))}
    </View>
  )
}

StatGrid.displayName = 'StatGrid'

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  cell: {
    width: '50%',
    padding: 20,
    borderColor: '#000',
  },
  cellBorderRight: {
    borderRightWidth: 3,
  },
  cellBorderBottom: {
    borderBottomWidth: 3,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 6,
  },
  value: {
    fontFamily: 'BebasNeue',
    fontSize: 44,
    lineHeight: 44,
  },
  unit: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    marginTop: 2,
  },
})
