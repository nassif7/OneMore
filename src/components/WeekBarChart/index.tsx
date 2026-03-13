import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TDayBar = {
  label: string
  count: number
}

interface IWeekBarChartProps {
  data: TDayBar[]
}

// ─── Week Bar Chart ───────────────────────────────────────────────────────────

export default function WeekBarChart({ data }: IWeekBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LAST 7 DAYS</Text>
      <View style={styles.chart}>
        {data.map((d, i) => {
          const isToday = i === data.length - 1
          const barH = (d.count / maxCount) * 100

          return (
            <View key={`${d.label}-${i}`} style={styles.barWrapper}>
              {d.count > 0 && <Text style={[styles.barCount, isToday && styles.barCountToday]}>{d.count}</Text>}
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
  )
}

WeekBarChart.displayName = 'WeekBarChart'

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  title: {
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
    color: '#000',
    marginBottom: 2,
  },
  barCountToday: {
    color: '#FF3B3B',
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
})
