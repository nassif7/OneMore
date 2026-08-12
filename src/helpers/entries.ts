import { TAGS } from '@/constants/tags'
import { TagId, TLogEntry } from '@/types'

const VALID_TAGS = new Set<TagId>(TAGS.map((t) => t.id))

const isValidTag = (x: unknown): x is TagId => typeof x === 'string' && VALID_TAGS.has(x as TagId)

const normalizeEntry = (raw: unknown): TLogEntry | null => {
  if (typeof raw === 'number') {
    return { id: String(raw), ts: raw }
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    if (typeof obj.id === 'string' && typeof obj.ts === 'number') {
      return isValidTag(obj.tag) ? { id: obj.id, ts: obj.ts, tag: obj.tag } : { id: obj.id, ts: obj.ts }
    }
  }
  return null
}

/**
 * Parses a raw JSON string from storage into TLogEntry[].
 * Tolerates legacy `number[]`, current `TLogEntry[]`, and mixed arrays
 * (a day only partially migrated). Malformed elements are dropped;
 * malformed/absent JSON returns []. Never sorts, never writes.
 */
export const parseEntries = (json: string | null): TLogEntry[] => {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeEntry).filter((e): e is TLogEntry => e !== null)
  } catch {
    console.warn('[Storage] Failed to parse JSON, returning empty array')
    return []
  }
}

export const serializeEntries = (entries: TLogEntry[]): string => JSON.stringify(entries)

/** Collision-resistant enough for a single-user local log: ms timestamp + 6 random base36 chars. */
export const generateEntryId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
