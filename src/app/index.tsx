import { BottomNav, QuickTagSheet, ScreenHeader } from '@/components'
import CounterBlock from '@/components/CounterBlock'
import NudgeBox from '@/components/NudgeBox'
import SmokeButton from '@/components/SmokeButton'
import useQuickTagPromptEnabled from '@/hooks/useQuickTagPromptEnabled'
import useSmokeLogger from '@/hooks/useSmokeLogger'
import useTagsEnabled from '@/hooks/useTagsEnabled'
import useTodayTimes from '@/hooks/useTodayTimes'
import { getNextNotificationTime } from '@/services/notifications'
import { computePattern } from '@/services/patternCalculator'
import { getSkipNudgeShown, setSkipNudgeShown } from '@/services/settings'
import { getAvgGap, getTimeSinceLast } from '@/services/stats'
import { setTag } from '@/services/storage'
import { TagId, TLogEntry } from '@/types'
import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

export default function HomeScreen() {
  const [avgGapMs, setAvgGapMs] = useState<number | null>(null)
  const [nextNotificationTime, setNextNotificationTime] = useState<number | null>(null)
  const [quickTagEntry, setQuickTagEntry] = useState<TLogEntry | null>(null)
  const [skipNudgeShown, setSkipNudgeShownState] = useState<boolean>(true)
  const { entries, setEntries } = useTodayTimes()
  const { enabled: tagsEnabled } = useTagsEnabled()
  const { enabled: quickPromptEnabled, setEnabled: setQuickPromptEnabled } = useQuickTagPromptEnabled()

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
  }, [entries, loadNudgeData])

  useEffect(() => {
    getSkipNudgeShown()
      .then(setSkipNudgeShownState)
      .catch((error) => console.error('[HomeScreen] Failed to load skip nudge state:', error))
  }, [])

  const { nudge, handleSmoke } = useSmokeLogger({
    onSmoked: (updated) => {
      setEntries(updated)
      if (tagsEnabled && quickPromptEnabled) setQuickTagEntry(updated[updated.length - 1])
    },
    onScheduled: loadNudgeData,
  })

  const handleTagSelect = async (tagId: TagId) => {
    if (!quickTagEntry) return
    try {
      await setTag(new Date(quickTagEntry.ts), quickTagEntry.id, tagId)
    } catch (error) {
      console.error('[HomeScreen] Failed to set tag:', error)
    } finally {
      setQuickTagEntry(null)
    }
  }

  const handleSkip = () => {
    if (!skipNudgeShown) {
      setSkipNudgeShownState(true)
      setSkipNudgeShown().catch((error) => console.error('[HomeScreen] Failed to save skip nudge state:', error))
    }
  }

  const count = entries.length
  const avgGap = useMemo(() => getAvgGap(entries), [entries])
  const timeSinceLast = useMemo(() => getTimeSinceLast(entries), [entries])

  return (
    <View style={styles.container}>
      <ScreenHeader showDate onAbout={() => router.push('/about')} />
      <CounterBlock count={count} avgGap={avgGap} timeSinceLast={timeSinceLast} />
      <NudgeBox nextNotificationTime={nextNotificationTime} nudge={nudge} />
      <SmokeButton onPress={handleSmoke} />
      <QuickTagSheet
        visible={quickTagEntry !== null}
        showSkipNudge={!skipNudgeShown}
        onSelect={handleTagSelect}
        onSkip={handleSkip}
        onDisablePrompt={() => setQuickPromptEnabled(false)}
        onClose={() => setQuickTagEntry(null)}
      />
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
