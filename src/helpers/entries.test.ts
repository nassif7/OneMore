import { generateEntryId, parseEntries, serializeEntries } from './entries'

describe('parseEntries', () => {
  it('returns [] for null', () => {
    expect(parseEntries(null)).toEqual([])
  })

  it('returns [] for malformed JSON', () => {
    expect(parseEntries('not json{')).toEqual([])
  })

  it('returns [] for valid JSON that is not an array', () => {
    expect(parseEntries('{}')).toEqual([])
  })

  it('normalizes legacy bare-number entries, deriving id from timestamp', () => {
    expect(parseEntries('[1000, 2000]')).toEqual([
      { id: '1000', ts: 1000 },
      { id: '2000', ts: 2000 },
    ])
  })

  it('passes through current-shape entries, including tag', () => {
    const json = JSON.stringify([{ id: 'a', ts: 1000, tag: 'BORED' }])
    expect(parseEntries(json)).toEqual([{ id: 'a', ts: 1000, tag: 'BORED' }])
  })

  it('passes through current-shape entries with no tag key unchanged', () => {
    const json = JSON.stringify([{ id: 'a', ts: 1000 }])
    const result = parseEntries(json)
    expect(result).toEqual([{ id: 'a', ts: 1000 }])
    expect('tag' in result[0]).toBe(false)
  })

  it('drops an invalid tag but keeps the entry', () => {
    const json = JSON.stringify([{ id: 'a', ts: 1000, tag: 'NOT_A_TAG' }])
    const result = parseEntries(json)
    expect(result).toEqual([{ id: 'a', ts: 1000 }])
  })

  it('normalizes a mixed array of legacy and current-shape entries in one call', () => {
    const json = JSON.stringify([1000, { id: 'a', ts: 2000, tag: 'BORED' }])
    expect(parseEntries(json)).toEqual([
      { id: '1000', ts: 1000 },
      { id: 'a', ts: 2000, tag: 'BORED' },
    ])
  })

  it('drops malformed elements but keeps valid siblings', () => {
    const json = JSON.stringify([{ foo: 'bar' }, { id: 'a', ts: 2000 }])
    expect(parseEntries(json)).toEqual([{ id: 'a', ts: 2000 }])
  })
})

describe('serializeEntries', () => {
  it('round-trips through parseEntries', () => {
    const entries = [{ id: 'a', ts: 1000, tag: 'COFFEE' as const }]
    expect(parseEntries(serializeEntries(entries))).toEqual(entries)
  })
})

describe('generateEntryId', () => {
  it('generates distinct ids across calls', () => {
    expect(generateEntryId()).not.toBe(generateEntryId())
  })
})
