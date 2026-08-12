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

export interface LogRowProps {
  id: string
  index: number
  time: string
  tag?: TagId
  gapMs: number | null
  avgGapMs: number | null
  onEdit: (id: string) => void
  onDelete: (id: string) => void
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
  showDate?: boolean
  onAbout?: () => void
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
  tag?: TagId
  onTagChange: (tag: TagId | undefined) => void
  tagsEnabled?: boolean
  onSave: () => void
  onClose: () => void
}

export interface UseSmokeLoggerProps {
  onSmoked: (updatedEntries: TLogEntry[]) => void
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

export interface TagPickerProps {
  value?: TagId
  onChange: (tag: TagId | undefined) => void
}

export interface QuickTagSheetProps {
  visible: boolean
  showSkipNudge: boolean
  onSelect: (tag: TagId) => void
  onSkip: () => void
  onDisablePrompt: () => void
  onClose: () => void
}

export interface TagBadgeProps {
  tag: TagId
  color?: string
}

export interface TagBreakdownProps {
  data: TTagCount[]
}

export interface ToggleProps {
  value: boolean
  onChange: (value: boolean) => void
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

export type TagId =
  | 'COFFEE'
  | 'AFTER_MEAL'
  | 'DRINKING'
  | 'SOCIAL'
  | 'WORK_BREAK'
  | 'STRESSED'
  | 'BORED'
  | 'LATE_NIGHT'
  | 'RELAXING'

export type TLogEntry = {
  id: string
  ts: number
  tag?: TagId
}

export type TDayEntry = {
  date: Date
  label: string
  fullDate: string
  entries: TLogEntry[]
}

export type TTagCount = {
  tag: TagId
  count: number
  pct: number
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
