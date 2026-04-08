// ─── Component Props ──────────────────────────────────────────────────────────

export interface AnimatedSplashScreenProps {
  onFinished: () => void
}

export interface CalendarSheetProps {
  visible: boolean
  selectedDateStr: string
  onDayPress: (dateStr: string) => void
  onClose: () => void
}

export interface CounterBlockProps {
  count: number
  avgGap: string
  timeSinceLast: string
}

export interface DayNavigatorProps {
  label: string
  fullDate: string
  isToday: boolean
  onPrev: () => void
  onNext: () => void
  onCalendar: () => void
}

export interface DayRowProps {
  day: TDayEntry
  isToday: boolean
  maxCount: number
  onPress: (day: TDayEntry) => void
}

export interface LogRowProps {
  index: number
  timestamp: number
  time: string
  gapMs: number | null
  avgGapMs: number | null
  onEdit: (ts: number) => void
  onDelete: (ts: number) => void
}

export interface MonthCalendarProps {
  monthData: Record<string, number>
  dailyAvg: number
}

export interface NudgeBoxProps {
  nextNotificationTime: number | null
  nudge: string | null
}

export interface NudgeTickerProps {
  nudge: string
}

export interface ScreenHeaderProps {
  showBack?: boolean
  title?: string
  showSubtitle?: boolean
  onReset?: () => void
}

export interface SmokeButtonProps {
  onPress: () => Promise<void>
}

export interface StatsComparisonProps {
  current: StatsComparisonData
  previous: StatsComparisonData | null
  periodLabel: string // e.g. "THIS WEEK" or "THIS MONTH"
}

export interface StatGridProps {
  stats: TStatCell[]
}

export interface TimePickerSheetProps {
  visible: boolean
  value: Date
  onChange: (date: Date) => void
  onSave: () => void
  onClose: () => void
}

export interface UseSmokeLoggerProps {
  onSmoked: (updatedTimes: number[]) => void
  onScheduled?: () => void
}

export interface WeekBarChartProps {
  data: TDayBar[]
  weekLabel: string
  currentWeekStats: TPeriodStats
  prevWeekStats: TPeriodStats | null
  onPrevWeek: () => void
  onNextWeek: () => void
  canGoNext: boolean
  onDayPress: (dateStr: string) => void
}

// ─── Data Types ───────────────────────────────────────────────────────────────

export interface StatsComparisonData {
  dailyAvg: number
  avgGapMinutes: number | null
  avgGapLabel: string
}

export type TPeriodStats = {
  dailyAvg: number
  avgGapMinutes: number | null
  avgGapLabel: string
}

export type TDayBar = {
  label: string
  count: number
  isToday: boolean
  dateStr: string
}

export type TDayEntry = {
  label: string
  fullDate: string
  times: number[]
}

export type TStatCell = {
  label: string
  value: string | number
  unit: string
  bg: string
  color?: string
  isAbove?: boolean
}

export type TWeekStats = {
  label: string
  days: TDayBar[]
}
