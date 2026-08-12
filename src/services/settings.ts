import { QUICK_TAG_PROMPT_ENABLED_KEY, TAG_SKIP_NUDGE_SHOWN_KEY, TAGS_ENABLED_KEY } from '@/constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// ─── Tags Enabled ─────────────────────────────────────────────────────────────
// Master switch for the whole mood-tag feature: history tag editing, row
// badges, and the Stats breakdown all depend on this.

export const getTagsEnabled = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(TAGS_ENABLED_KEY)
  return val === null ? true : val === 'true'
}

export const setTagsEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(TAGS_ENABLED_KEY, enabled ? 'true' : 'false')
}

// ─── Quick Tag Prompt Enabled ─────────────────────────────────────────────────
// Narrower switch: only controls whether the quick tag sheet pops up right
// after logging. Independent of TAGS_ENABLED — turning this off still leaves
// history tag editing, badges, and the Stats breakdown available.

export const getQuickTagPromptEnabled = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(QUICK_TAG_PROMPT_ENABLED_KEY)
  return val === null ? true : val === 'true'
}

export const setQuickTagPromptEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(QUICK_TAG_PROMPT_ENABLED_KEY, enabled ? 'true' : 'false')
}

// ─── Skip Nudge ───────────────────────────────────────────────────────────────
// Tracks whether the one-time "don't show this again" offer (shown the first
// time a user skips the quick tag sheet) has already been shown.

export const getSkipNudgeShown = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(TAG_SKIP_NUDGE_SHOWN_KEY)
  return val === 'true'
}

export const setSkipNudgeShown = async (): Promise<void> => {
  await AsyncStorage.setItem(TAG_SKIP_NUDGE_SHOWN_KEY, 'true')
}
