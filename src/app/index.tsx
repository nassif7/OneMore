import { BottomNav, ScreenHeader } from '@/components'
import CounterBlock from '@/components/CounterBlock'
import NudgeBox from '@/components/NudgeBox'
import SmokeButton from '@/components/SmokeButton'
import useSmokeLogger from '@/hooks/useSmokeLogger'
import useTodayTimes from '@/hooks/useTodayTimes'
import { getNextNotificationBody, getNextNotificationTime } from '@/services/notifications'
import { computePattern } from '@/services/patternCalculator'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function HomeScreen() {
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [nextNotificationTime, setNextNotificationTime] = useState<number | null>(null)
  const [nextNotificationBody, setNextNotificationBody] = useState<string | null>(null)
  const { times, setTimes } = useTodayTimes()

  const loadNudgeData = useCallback(async () => {
    const [pattern, time, body] = await Promise.all([
      computePattern(),
      getNextNotificationTime(),
      getNextNotificationBody(),
    ])
    setAvgGapMs(pattern.avgGapMs)
    setNextNotificationTime(time)
    setNextNotificationBody(body)
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
  const lastTs = times.length > 0 ? times[times.length - 1] : null
  const timeSinceLastMs = useMemo(() => (lastTs !== null ? Date.now() - lastTs : null), [lastTs])
  const gapRatio = useMemo(
    () => (timeSinceLastMs !== null && avgGapMs !== null ? timeSinceLastMs / avgGapMs : null),
    [timeSinceLastMs, avgGapMs],
  )

  return (
    <View style={styles.container}>
      <ScreenHeader />
      <CounterBlock count={count} avgGap={avgGap} timeSinceLast={timeSinceLast} />
      <NudgeBox nextNotificationTime={nextNotificationTime} nextNotificationBody={nextNotificationBody} />
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
