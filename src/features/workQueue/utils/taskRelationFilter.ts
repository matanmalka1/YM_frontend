export type LinkedFilter = 'linked' | 'unlinked'
export type ScopeFilter = 'system' | 'manual'

export const parseLinkedFilter = (value: string | null): LinkedFilter | null =>
  value === 'linked' || value === 'unlinked' ? value : null

export const parseScopeFilter = (value: string | null): ScopeFilter | null =>
  value === 'system' || value === 'manual' ? value : null

/** Synthetic field key collapsing scope + linked into one dropdown. */
export const TASK_RELATION_KEY = 'task_relation'

export const taskRelationOptions = [
  { value: '', label: 'כל העבודה הפעילה' },
  { value: 'manual', label: 'משימות עצמאיות בלבד' },
  { value: 'linked', label: 'פריטים עם משימה קשורה' },
  { value: 'unlinked', label: 'פריטים ללא משימה קשורה' },
  { value: 'system', label: 'פריטי עבודה שאינם משימה' },
]

/** Collapse the two underlying filters into the single dropdown value. */
export const taskRelationValue = (scope: ScopeFilter | null, linked: LinkedFilter | null): string => {
  if (scope === 'manual') return 'manual'
  if (scope === 'system') return 'system'
  if (linked === 'linked') return 'linked'
  if (linked === 'unlinked') return 'unlinked'
  return ''
}

/** Expand the single dropdown value back into the scope + linked URL params. */
export const expandTaskRelation = (value: string): { scope: string; linked: string } => ({
  scope: value === 'manual' || value === 'system' ? value : '',
  linked: value === 'linked' || value === 'unlinked' ? value : '',
})
