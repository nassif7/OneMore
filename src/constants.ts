// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const DAY_PREFIX = 'day:'
export const NEXT_NOTIF_TIME_KEY = 'next_notification_time'
export const NEXT_NOTIF_BODY_KEY = 'next_notification_body'
export const PENDING_NOTIF_KEY = 'pending_notification_id'
export const FIRST_CIG_NOTIF_KEY = 'first_cig_notif_id'

// ─── Nudges ───────────────────────────────────────────────────────────────────

export const NUDGES = [
  'GO ON THEN.',
  "WE'RE NOT JUDGING.",
  'YOUR LUNGS, YOUR RULES.',
  'ONE MORE NEVER KILLED— wait.',
  'DO IT. DO IT. DO IT.',
  'FEELING THAT ITCH?',
  'YOUR LUNGS CALLED. THEY MISS YOU.',
  'ACCOUNTABILITY? NEVER HEARD OF HER.',
]

// ─── Thresholds ───────────────────────────────────────────────────────────────

export const MIN_GAPS_FOR_CUTOFF = 5

// ─── Notification Scheduling ──────────────────────────────────────────────────

/** Multiplier to add buffer to predicted notification time (e.g., 1.1x = +10%) */
export const NEXT_NOTIF_TIME_BUFFER = 1.1

/** Minutes before average last cigarette time to stop scheduling notifications */
export const SLEEP_TIME_CUTOFF_MINUTES = 30
