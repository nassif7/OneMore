import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { addLog, clearAllData, deleteLog, editLog, getDay, keyForDate, logCigarette, setTag } from './storage'

jest.mock('expo-notifications', () => ({
  cancelAllScheduledNotificationsAsync: jest.fn(),
}))

const TEST_DATE = new Date('2024-01-15T12:00:00')

beforeEach(async () => {
  await AsyncStorage.clear()
  jest.clearAllMocks()
})

describe('logCigarette', () => {
  it('appends an entry with a generated id and current timestamp', async () => {
    const before = Date.now()
    const entries = await logCigarette()
    expect(entries).toHaveLength(1)
    expect(typeof entries[0].id).toBe('string')
    expect(entries[0].ts).toBeGreaterThanOrEqual(before)
  })

  it('generates distinct ids across sequential calls', async () => {
    const first = await logCigarette()
    const second = await logCigarette()
    expect(second).toHaveLength(2)
    expect(second[0].id).not.toBe(second[1].id)
    expect(first[0].id).toBe(second[0].id)
  })
})

describe('backward compatibility with legacy data', () => {
  it('getDay returns derived ids for a legacy number[] day and leaves the raw stored value unchanged', async () => {
    const key = keyForDate(TEST_DATE)
    const legacyRaw = JSON.stringify([1000, 2000])
    await AsyncStorage.setItem(key, legacyRaw)

    const entries = await getDay(TEST_DATE)
    expect(entries).toEqual([
      { id: '1000', ts: 1000 },
      { id: '2000', ts: 2000 },
    ])

    const rawAfterRead = await AsyncStorage.getItem(key)
    expect(rawAfterRead).toBe(legacyRaw)
  })

  it('rewrites the whole day to object shape once any entry in it is mutated', async () => {
    const key = keyForDate(TEST_DATE)
    await AsyncStorage.setItem(key, JSON.stringify([1000, 2000]))

    await addLog(TEST_DATE, 3000)

    const rawAfterWrite = await AsyncStorage.getItem(key)
    const parsed = JSON.parse(rawAfterWrite as string)
    expect(parsed).toHaveLength(3)
    for (const entry of parsed) {
      expect(typeof entry).toBe('object')
      expect(typeof entry.id).toBe('string')
      expect(typeof entry.ts).toBe('number')
    }
  })

  it('deleteLog can remove a legacy entry by its derived id', async () => {
    const key = keyForDate(TEST_DATE)
    await AsyncStorage.setItem(key, JSON.stringify([1000, 2000]))

    const updated = await deleteLog(TEST_DATE, '1000')
    expect(updated).toEqual([{ id: '2000', ts: 2000 }])
  })
})

describe('addLog', () => {
  it('creates a fresh generated id (not derived from timestamp) and inserts in sorted position', async () => {
    await addLog(TEST_DATE, 3000)
    const updated = await addLog(TEST_DATE, 1000, 'COFFEE')

    expect(updated.map((e) => e.ts)).toEqual([1000, 3000])
    expect(updated[0].id).not.toBe('1000')
    expect(updated[0].tag).toBe('COFFEE')
  })
})

describe('editLog', () => {
  it('matches by id, updates only that entry, leaves others and their tags untouched', async () => {
    const afterFirst = await addLog(TEST_DATE, 1000, 'BORED')
    const afterSecond = await addLog(TEST_DATE, 2000)
    const targetId = afterSecond.find((e) => e.ts === 2000)!.id
    const otherId = afterFirst[0].id

    const updated = await editLog(TEST_DATE, targetId, 5000)

    const edited = updated.find((e) => e.id === targetId)!
    const other = updated.find((e) => e.id === otherId)!
    expect(edited.ts).toBe(5000)
    expect(other.ts).toBe(1000)
    expect(other.tag).toBe('BORED')
  })
})

describe('deleteLog', () => {
  it('removes only the entry matching the given id', async () => {
    const afterFirst = await addLog(TEST_DATE, 1000)
    const afterSecond = await addLog(TEST_DATE, 2000)
    const idToDelete = afterFirst[0].id
    expect(afterSecond).toHaveLength(2)

    const updated = await deleteLog(TEST_DATE, idToDelete)
    expect(updated).toHaveLength(1)
    expect(updated[0].ts).toBe(2000)
  })
})

describe('setTag', () => {
  it('sets a tag on an untagged entry', async () => {
    const created = await addLog(TEST_DATE, 1000)
    const updated = await setTag(TEST_DATE, created[0].id, 'STRESSED')
    expect(updated[0].tag).toBe('STRESSED')
  })

  it('clears an existing tag', async () => {
    const created = await addLog(TEST_DATE, 1000, 'STRESSED')
    const updated = await setTag(TEST_DATE, created[0].id, undefined)
    expect('tag' in updated[0]).toBe(false)
  })

  it('is a no-op for an unknown id', async () => {
    const created = await addLog(TEST_DATE, 1000)
    const updated = await setTag(TEST_DATE, 'nonexistent-id', 'BORED')
    expect(updated).toEqual(created)
  })
})

describe('clearAllData', () => {
  it('removes all day keys and notification keys, and cancels scheduled notifications', async () => {
    await addLog(TEST_DATE, 1000)
    await AsyncStorage.setItem('next_notification_time', '123')

    await clearAllData()

    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
    const remainingKeys = await AsyncStorage.getAllKeys()
    expect(remainingKeys).toEqual([])
  })
})
