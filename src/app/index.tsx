import { BottomNav, ScreenHeader } from '@/components'
import CounterBlock from '@/components/CounterBlock'
import NudgeBox from '@/components/NudgeBox'
import SmokeButton from '@/components/SmokeButton'
import useSmokeLogger from '@/hooks/useSmokeLogger'
import useTodayTimes from '@/hooks/useTodayTimes'
import { getNextNotificationTime } from '@/services/notifications'
import { computePattern } from '@/services/patternCalculator'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function HomeScreen() {
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [nextNotificationTime, setNextNotificationTime] = useState<number | null>(null)
  const { times, setTimes } = useTodayTimes()

  const loadNudgeData = useCallback(async () => {
    try {
      const [pattern, time] = await Promise.all([computePattern(), getNextNotificationTime()])
      setAvgGapMs(pattern.avgGapMs)
      setNextNotificationTime(time)
    } catch (error) {
      console.error('[HomeScreen] Failed to load nudge data:', error)
    }
  }, [])

  useEffect(() => {
    loadNudgeData()
  }, [times, loadNudgeData])

  const { nudge, handleSmoke } = useSmokeLogger({
    onSmoked: (updated) => setTimes(updated),
    onScheduled: loadNudgeData,
  })

  const count = times.length
  const avgGap = useMemo(() => getAvgGap(times), [times])
  const timeSinceLast = useMemo(() => getTimeSinceLast(times), [times])

  return (
    <View style={styles.container}>
      <ScreenHeader />
      <CounterBlock count={count} avgGap={avgGap} timeSinceLast={timeSinceLast} />
      <NudgeBox nextNotificationTime={nextNotificationTime} nudge={nudge} />
      <SmokeButton onPress={handleSmoke} />
      <BottomNav />
    </View>
  )
}

HomeScreen.displayName = 'HomeScreen'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0E8',
  },
})
