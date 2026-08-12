import { Armchair, Briefcase, Coffee, Hourglass, Moon, Users, Utensils, Wine, Zap } from 'lucide-react-native'
import { TagId } from '@/types'

export type TagMeta = {
  id: TagId
  label: string
  icon: typeof Coffee
}

export const TAGS: TagMeta[] = [
  { id: 'COFFEE', label: 'COFFEE', icon: Coffee },
  { id: 'AFTER_MEAL', label: 'AFTER MEAL', icon: Utensils },
  { id: 'DRINKING', label: 'DRINKING', icon: Wine },
  { id: 'SOCIAL', label: 'SOCIAL', icon: Users },
  { id: 'WORK_BREAK', label: 'WORK BREAK', icon: Briefcase },
  { id: 'STRESSED', label: 'STRESSED', icon: Zap },
  { id: 'BORED', label: 'BORED', icon: Hourglass },
  { id: 'LATE_NIGHT', label: 'LATE NIGHT', icon: Moon },
  { id: 'RELAXING', label: 'RELAXING', icon: Armchair },
]

export const TAG_MAP: Record<TagId, TagMeta> = Object.fromEntries(TAGS.map((t) => [t.id, t])) as Record<TagId, TagMeta>
