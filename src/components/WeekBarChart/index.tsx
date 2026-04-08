import { WeekBarChartProps } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Constants ────────────────────────────────────────────────────────────────

const BAR_TRACK_HEIGHT = 150

// ─── Week Bar Chart ───────────────────────────────────────────────────────────

export default function WeekBarChart({
  data,
  weekLabel,
  onPrevWeek,
  onNextWeek,
  canGoNext,
  onDayPress,
}: WeekBarChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <View style={styles.container}>
      {/* Navigation header */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={onPrevWeek} style={styles.navBtn}>
          <ChevronLeft size={24} color="#000" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.title}>{weekLabel}</Text>
        <TouchableOpacity onPress={onNextWeek} style={styles.navBtn} disabled={!canGoNext}>
          <ChevronRight size={24} color={canGoNext ? '#000' : '#ccc'} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Bar chart */}
      <View style={styles.chart}>
        {data.map((d, i) => {
          const barH = (d.count / maxCount) * BAR_TRACK_HEIGHT
          return (
            <TouchableOpacity
              key={`${d.label}-${i}`}
              style={styles.barWrapper}
              onPress={() => d.count > 0 && onDayPress(d.dateStr)}
              activeOpacity={d.count > 0 ? 0.7 : 1}
            >
              {d.count > 0 && <Text style={[styles.barCount, d.isToday && styles.barCountToday]}>{d.count}</Text>}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barH,
                      backgroundColor: d.isToday ? '#FF4500' : '#000',
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, d.isToday && styles.barLabelToday]}>{d.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

WeekBarChart.displayName = 'WeekBarChart'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderBottomWidth: 3,
    borderColor: '#000',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    padding: 4,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#000',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_TRACK_HEIGHT + 30,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: BAR_TRACK_HEIGHT + 30,
    justifyContent: 'flex-end',
    paddingHorizontal: 3,
  },
  barTrack: {
    width: '100%',
    height: BAR_TRACK_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    minHeight: 4,
  },
  barCount: {
    fontFamily: 'BebasNeue',
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
  },
  barCountToday: {
    color: '#FF4500',
  },
  barLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#000',
    marginTop: 4,
  },
  barLabelToday: {
    color: '#FF4500',
  },
})
