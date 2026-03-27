import { StatGridProps } from '@/types'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function StatGrid({ stats }: StatGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((s, i) => {
        const bg = s.isAbove ? '#FF4500' : s.bg
        const textColor = s.isAbove ? '#fff' : s.color || '#000'
        const labelColor = s.isAbove ? 'rgba(255,255,255,0.7)' : s.color || '#666'
        const unitColor = s.isAbove ? 'rgba(255,255,255,0.6)' : s.color || '#999'

        return (
          <View
            key={s.label}
            style={[
              styles.cell,
              { backgroundColor: bg },
              i % 2 === 0 && styles.cellBorderRight,
              i < stats.length - 2 && styles.cellBorderBottom,
            ]}
          >
            <Text style={[styles.label, { color: labelColor }]}>{s.label}</Text>
            <Text style={[styles.value, { color: textColor }]}>{s.value}</Text>
            <Text style={[styles.unit, { color: unitColor }]}>{s.unit}</Text>
          </View>
        )
      })}
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
