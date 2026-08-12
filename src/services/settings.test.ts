import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  getQuickTagPromptEnabled,
  getSkipNudgeShown,
  getTagsEnabled,
  setQuickTagPromptEnabled,
  setSkipNudgeShown,
  setTagsEnabled,
} from './settings'

beforeEach(async () => {
  await AsyncStorage.clear()
})

describe('getTagsEnabled', () => {
  it('defaults to true when never set', async () => {
    expect(await getTagsEnabled()).toBe(true)
  })

  it('reflects a previously stored value', async () => {
    await setTagsEnabled(false)
    expect(await getTagsEnabled()).toBe(false)

    await setTagsEnabled(true)
    expect(await getTagsEnabled()).toBe(true)
  })
})

describe('getQuickTagPromptEnabled', () => {
  it('defaults to true when never set', async () => {
    expect(await getQuickTagPromptEnabled()).toBe(true)
  })

  it('reflects a previously stored value, independent of getTagsEnabled', async () => {
    await setQuickTagPromptEnabled(false)
    expect(await getQuickTagPromptEnabled()).toBe(false)
    expect(await getTagsEnabled()).toBe(true)

    await setQuickTagPromptEnabled(true)
    expect(await getQuickTagPromptEnabled()).toBe(true)
  })
})

describe('getSkipNudgeShown', () => {
  it('defaults to false when never set', async () => {
    expect(await getSkipNudgeShown()).toBe(false)
  })

  it('is true once marked shown, and stays true', async () => {
    await setSkipNudgeShown()
    expect(await getSkipNudgeShown()).toBe(true)

    await setSkipNudgeShown()
    expect(await getSkipNudgeShown()).toBe(true)
  })
})
