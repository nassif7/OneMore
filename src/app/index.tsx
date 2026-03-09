import { BottomNav, ScreenHeader } from '@/components'
import CounterBlock from '@/components/CounterBlock'
import NudgeTicker from '@/components/NudgeTicker'
import SmokeButton from '@/components/SmokeButton'
import useSmokeLogger from '@/hooks/useSmokeLogger'
import useTodayTimes from '@/hooks/useTodayTimes'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import React from 'react'
import { StyleSheet, View } from 'react-native'

// ─── Home Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { times, setTimes } = useTodayTimes()

  const { nudge, handleSmoke } = useSmokeLogger({
    onSmoked: (updated) => setTimes(updated),
  })

  const count = times.length
  const avgGap = getAvgGap(times)
  const timeSinceLast = getTimeSinceLast(times)

  return (
    <View style={styles.container}>
      <ScreenHeader />
      <CounterBlock count={count} avgGap={avgGap} timeSinceLast={timeSinceLast} />
      <NudgeTicker nudge={nudge} />
      <SmokeButton onPress={handleSmoke} />
      <BottomNav />
    </View>
  )
}

HomeScreen.displayName = 'HomeScreen'

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
})
