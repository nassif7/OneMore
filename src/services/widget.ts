import { toCalendarDateString } from '@/helpers'
import { buildSnapshot, buildTimeline, carryForward, collectPending, mergePending } from '@/helpers/widgetSync'
import { addLog, getDay } from '@/services/storage'
import { TLogEntry } from '@/types'
import OneMoreWidget from '@/widgets/OneMoreWidget'
import { addUserInteractionListener } from 'expo-widgets'
import { AppState, Platform } from 'react-native'

// Widget buttons need iOS 17; on iOS 16 the widget hides +1 and only shows count and time.
const isInteractive = (): boolean => Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 17

const mergedListeners = new Set<() => void>()

/** Notifies screens that taps from the widget were merged into storage, so they can reload. */
export const onWidgetMerged = (listener: () => void): (() => void) => {
  mergedListeners.add(listener)
  return () => mergedListeners.delete(listener)
}

const doSync = async (): Promise<void> => {
  if (Platform.OS !== 'ios') return
  const now = new Date()

  // 1. Merge pending +1 taps into the main store. They are read from every timeline entry
  //    (see collectPending), then filed under the day of their own timestamp.
  const pending = collectPending(await OneMoreWidget.getTimeline())
  let merged = 0
  if (pending.length > 0) {
    const existingByDate: Record<string, TLogEntry[]> = {}
    for (const ts of pending) {
      const dateStr = toCalendarDateString(new Date(ts))
      if (!(dateStr in existingByDate)) existingByDate[dateStr] = await getDay(new Date(ts))
    }
    for (const { ts } of mergePending(pending, existingByDate)) {
      await addLog(new Date(ts), ts)
      merged += 1
    }
  }

  // 2. Rebuild the snapshot from storage. Re-read the timeline right before writing and keep any
  //    tap that arrived after step 1 queued (carryForward); see its comment for the accepted race.
  const today = await getDay(now)
  const stillPending = carryForward(collectPending(await OneMoreWidget.getTimeline()), pending)
  OneMoreWidget.updateTimeline(buildTimeline(buildSnapshot(today, stillPending, now, isInteractive()), now))

  if (merged > 0) mergedListeners.forEach((l) => l())
}

let chain: Promise<void> = Promise.resolve()

/**
 * Pushes the current state to the widget and merges its pending taps. Calls are serialised and the
 * merge is idempotent, so the foreground sync and the interaction listener can safely overlap.
 * Never rejects: a widget failure must not break logging.
 */
export const syncWidget = (): Promise<void> => {
  chain = chain.then(doSync).catch((error) => console.error('[Widget] Sync failed:', error))
  return chain
}

/** Syncs on launch, on every foreground, and whenever a widget button is pressed while the app is alive. */
export const startWidgetSync = (): (() => void) => {
  if (Platform.OS !== 'ios') return () => {}
  syncWidget()
  const appState = AppState.addEventListener('change', (s) => {
    if (s === 'active') syncWidget()
  })
  const interaction = addUserInteractionListener(() => {
    syncWidget()
  })
  return () => {
    appState.remove()
    interaction.remove()
  }
}
