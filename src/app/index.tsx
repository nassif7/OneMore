import { BottomNav, ScreenHeader } from '@/components'
import { scheduleFirstCigNotification, scheduleNextNotification } from '@/services/notifications'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { getDay, logCigarette } from '@/services/storage'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HomeScreenProps {
  navigation?: {
    navigate: (screen: string) => void
  }
}

const NUDGES: string[] = [
  'GO ON THEN.',
  "WE'RE NOT JUDGING.",
  'YOUR LUNGS, YOUR RULES.',
  'ONE MORE NEVER KILLED— wait.',
  'DO IT. DO IT. DO IT.',
  'ACCOUNTABILITY? NEVER HEARD OF HER.',
]

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [times, setTimes] = useState<number[]>([])
  const [nudge, setNudge] = useState<string>(NUDGES[0])
  const [pressed, setPressed] = useState<boolean>(false)

  const buttonScale = useRef(new Animated.Value(1)).current
  const flashOpacity = useRef(new Animated.Value(0)).current

  // Derived stats
  const count = times.length
  const avgGap = getAvgGap(times)
  const timeSinceLast = getTimeSinceLast(times)

  // Load today's data on mount and when app comes back to foreground
  const loadToday = useCallback(async () => {
    const todayTimes = await getDay(new Date())
    setTimes(todayTimes)
  }, [])

  useEffect(() => {
    loadToday()

    // Reload if user backgrounds and returns (midnight rollover etc.)
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadToday()
    })
    return () => sub.remove()
  }, [loadToday])

  const handleSmoke = async (): Promise<void> => {
    // Haptic thud
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)

    // Button slam
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.9, duration: 70, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, damping: 4, stiffness: 300 }),
    ]).start()

    // Fire flash
    Animated.sequence([
      Animated.timing(flashOpacity, { toValue: 0.3, duration: 40, useNativeDriver: true }),
      Animated.timing(flashOpacity, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start()

    // Persist to storage, get back updated times array
    const updated = await logCigarette()
    setTimes(updated)
    const lastCigTime = updated[updated.length - 1]
    if (updated.length === 1) {
      // First cig of the day — schedule tomorrow's first cig notif
      await scheduleFirstCigNotification()
    }
    await scheduleNextNotification(lastCigTime)

    setNudge(NUDGES[Math.floor(Math.random() * NUDGES.length)])

    setPressed(true)
    setTimeout(() => setPressed(false), 120)
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="ONEMORE" showSubtitle={true} />

      {/* Counter block */}
      <View style={styles.counterBlock}>
        <View>
          <Text style={styles.label}>TODAY'S COUNT</Text>
          <Text style={styles.countNumber}>{count}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 8 }}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>AVG GAP</Text>
            <Text style={styles.statValue}>{avgGap}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.statLabel}>LAST ONE</Text>
            <Text style={styles.statValue}>{timeSinceLast}</Text>
          </View>
        </View>
      </View>

      {/* Nudge ticker */}
      <View style={styles.nudgeTicker}>
        <Text style={styles.nudgeText}>{nudge}</Text>
      </View>

      {/* Button area */}
      <View style={styles.buttonArea}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleSmoke}
            activeOpacity={1}
            style={[styles.smokeButton, pressed && styles.smokeButtonPressed]}
          >
            <Text style={[styles.buttonText, pressed && styles.buttonTextPressed]}>{'+\nONE MORE'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Fire flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#FF4500', opacity: flashOpacity }]}
      />
      <BottomNav />
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
  topBar: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  appName: {
    fontFamily: 'BebasNeue',
    fontSize: 42,
    lineHeight: 42,
    letterSpacing: 2,
    color: '#000',
  },
  tagline: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#555',
    letterSpacing: 1,
    marginTop: 2,
  },
  dateText: {
    fontFamily: 'BebasNeue',
    fontSize: 13,
    letterSpacing: 2,
    color: '#000',
  },
  counterBlock: {
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
  nudgeTicker: {
    borderBottomWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#000',
  },
  nudgeText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#FF3B3B',
    letterSpacing: 3,
  },
  buttonArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smokeButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF3B3B',
    borderWidth: 3,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smokeButtonPressed: {
    backgroundColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'BebasNeue',
    fontSize: 30,
    color: '#fff',
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 34,
  },
  buttonTextPressed: {
    color: '#FF3B3B',
  },
  bottomNav: {
    borderTopWidth: 3,
    borderColor: '#000',
    flexDirection: 'row',
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderColor: '#000',
    backgroundColor: '#F5F0E8',
  },
  navText: {
    fontFamily: 'BebasNeue',
    fontSize: 16,
    letterSpacing: 3,
    color: '#000',
  },
})
