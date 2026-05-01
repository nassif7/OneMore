import { NUDGES } from '@/constants'
import { NudgeBoxProps } from '@/types'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

function formatTimeUntil(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes <= 0) return 'SOON'
  if (totalMinutes < 60) return `${totalMinutes}M`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}H ${m}M` : `${h}H`
}

export default function NudgeBox({ nextNotificationTime, nudge }: NudgeBoxProps) {
  const fallbackNudge = useMemo(() => NUDGES[Math.floor(Math.random() * NUDGES.length)], [])

  const timeUntil = nextNotificationTime !== null ? formatTimeUntil(nextNotificationTime - Date.now()) : null

  const body = nudge ?? fallbackNudge

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{timeUntil !== null ? `IN ${timeUntil}` : 'ONEMORE'}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  )
}

NudgeBox.displayName = 'NudgeBox'

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    letterSpacing: 2,
    color: '#fff',
  },
  body: {
    fontFamily: 'BebasNeue',
    fontSize: 22,
    letterSpacing: 2,
    color: '#C0392B',
    flexShrink: 1,
  },
})
