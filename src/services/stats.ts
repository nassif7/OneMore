import { formatAvgGap } from '@/helpers/gap'
import { TLogEntry } from '@/types'

export const formatTime = (ts: number): string => {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export const getAvgGap = (entries: TLogEntry[]): string => formatAvgGap(entries.map((e) => e.ts))

export const getTimeSinceLast = (entries: TLogEntry[]): string => {
  if (entries.length === 0) return 'N/A'
  const diffMs = Date.now() - entries[entries.length - 1].ts
  const mins = Math.round(diffMs / 60000)
  return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ${mins % 60}m ago`
}
