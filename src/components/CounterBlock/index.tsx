import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ICounterBlockProps {
  count: number
  avgGap: string
  timeSinceLast: string
}

export default function CounterBlock({ count, avgGap, timeSinceLast }: ICounterBlockProps) {
  return (
    <View style={styles.container}>
      {/* Count */}
      <View>
        <Text style={styles.label}>TODAY'S COUNT</Text>
        <Text style={styles.countNumber}>{count}</Text>
      </View>

      {/* Side stats */}
      <View style={styles.sideStats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>AVG GAP</Text>
          <Text style={styles.statValue}>{avgGap}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>LAST ONE</Text>
          <Text style={styles.statValue}>{timeSinceLast}</Text>
        </View>
      </View>
    </View>
  )
}

CounterBlock.displayName = 'CounterBlock'

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#F5F0E8',
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 3,
    color: '#000',
    marginBottom: 2,
  },
  countNumber: {
    fontFamily: 'BebasNeue',
    fontSize: 100,
    lineHeight: 100,
    letterSpacing: -2,
    color: '#000',
  },
  sideStats: {
    alignItems: 'flex-end',
    gap: 8,
  },
  stat: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 2,
    color: '#666',
  },
  statValue: {
    fontFamily: 'BebasNeue',
    fontSize: 22,
    color: '#000',
    letterSpacing: 1,
  },
})
