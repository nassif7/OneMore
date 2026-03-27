import { NUDGES } from '@/services/notifications'
import React, { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface INudgeBoxProps {
  nextNotificationTime: number | null
  nextNotificationBody: string | null
}

function formatTimeUntil(ms: number): string {
  const totalMinutes = Math.round(ms / 60000)
  if (totalMinutes <= 0) return 'SOON'
  if (totalMinutes < 60) return `${totalMinutes}M`
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return m > 0 ? `${h}H ${m}M` : `${h}H`
}

export default function NudgeBox({ nextNotificationTime, nextNotificationBody }: INudgeBoxProps) {
  const fallbackNudge = useMemo(() => NUDGES[Math.floor(Math.random() * NUDGES.length)], [])

  const timeUntil = nextNotificationTime !== null ? formatTimeUntil(nextNotificationTime - Date.now()) : null

  const body = nextNotificationBody ?? fallbackNudge

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
    color: '#FF4500',
    flexShrink: 1,
  },
})
