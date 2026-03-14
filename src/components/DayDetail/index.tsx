import { TDayEntry } from '@/hooks/useHistoryData'
import { computePattern } from '@/services/notifications'
import { formatTime } from '@/services/stats'
import React, { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IDayDetailProps {
  day: TDayEntry | null
  onClose: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatGap = (ms: number): string => {
  const mins = Math.round(ms / 60000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const gapColor = (gapMs: number, avgGapMs: number): string => {
  const ratio = gapMs / avgGapMs
  if (ratio > 1.5) return '#2E7D32' // deep green — well above avg
  if (ratio > 1.0) return '#66BB6A' // light green — above avg
  if (ratio > 0.85) return '#9E9E9E' // gray — on average
  if (ratio > 0.5) return '#FF3B3B' // danger red — below avg
  return '#B71C1C' // warning red — very short gap
}

// ─── Day Detail ───────────────────────────────────────────────────────────────

export default function DayDetail({ day, onClose }: IDayDetailProps) {
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)

  useEffect(() => {
    if (!day) return
    computePattern().then((p) => setAvgGapMs(p.avgGapMs))
  }, [day])

  if (!day) return null

  return (
    <Modal visible={!!day} animationType="slide" transparent onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{day.label}</Text>
            <Text style={styles.date}>{day.fullDate}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Log list */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {day.times.length === 0 && <Text style={styles.emptyText}>— CLEAN DAY —</Text>}

          {day.times.map((ts, i) => {
            const gapMs = i > 0 ? ts - day.times[i - 1] : null
            const color = gapMs !== null && avgGapMs !== null ? gapColor(gapMs, avgGapMs) : null

            return (
              <View key={ts} style={styles.logRow}>
                {/* Index */}
                <Text style={styles.logIndex}>#{i + 1}</Text>

                {/* Time + gap */}
                <View style={styles.logMain}>
                  <Text style={styles.logTime}>{formatTime(ts)}</Text>
                  {gapMs !== null && <Text style={styles.logGap}>+{formatGap(gapMs)} since last</Text>}
                </View>

                {/* Gap bar */}
                {gapMs !== null && gapMs > 0 && color && (
                  <View style={styles.gapBarTrack}>
                    <View style={[styles.gapBar, { backgroundColor: color }]} />
                  </View>
                )}

                {/* Spacer to align rows without gap bar */}
                {(gapMs === null || gapMs === 0) && <View style={styles.gapBarSpacer} />}
              </View>
            )
          })}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  )
}

DayDetail.displayName = 'DayDetail'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#F5F0E8',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000',
    maxHeight: '75%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#000',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingBottom: 16,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 36,
    letterSpacing: 2,
    color: '#000',
    lineHeight: 36,
  },
  date: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#666',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderWidth: 3,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  closeButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 16,
    color: '#000',
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 3,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
  logRow: {
    borderBottomWidth: 2,
    borderColor: '#000',
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIndex: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#999',
    letterSpacing: 1,
    width: 24,
  },
  logMain: {
    flex: 1,
    gap: 2,
  },
  logTime: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    color: '#000',
    letterSpacing: 2,
    lineHeight: 28,
  },
  logGap: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#666',
    letterSpacing: 1,
  },
  gapBarTrack: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#000',
    overflow: 'hidden',
    backgroundColor: '#e0dbd0',
  },
  gapBar: {
    width: '100%',
    height: '100%',
  },
  gapBarSpacer: {
    width: 40,
    height: 40,
  },
})
