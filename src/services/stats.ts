import { TLogEntry } from '@/types'

export const formatTime = (ts: number): string => {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const getAvgGap = (entries: TLogEntry[]): string => {
  if (entries.length < 2) return 'N/A'
  const gaps = entries.slice(1).map((e, i) => e.ts - entries[i].ts)
  const avgMs = gaps.reduce((a, b) => a + b, 0) / gaps.length
  const mins = Math.round(avgMs / 60000)
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export const getTimeSinceLast = (entries: TLogEntry[]): string => {
  if (entries.length === 0) return 'N/A'
  const diffMs = Date.now() - entries[entries.length - 1].ts
  const mins = Math.round(diffMs / 60000)
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}
