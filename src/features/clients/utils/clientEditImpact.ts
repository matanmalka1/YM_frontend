import type { ClientStatus, EntityType } from '../api'

export const buildClientEditImpactMessage = (
  oldStatus: ClientStatus,
  newStatus: ClientStatus,
  oldEntityType: EntityType | null | undefined,
  newEntityType: EntityType | null | undefined,
): string | null => {
  const statusChangesToDestructive = newStatus !== oldStatus && (newStatus === 'frozen' || newStatus === 'closed')
  const entityTypeChanged = newEntityType != null && newEntityType !== oldEntityType

  if (!statusChangesToDestructive && !entityTypeChanged) return null

  const lines: string[] = []

  if (statusChangesToDestructive) {
    const label = newStatus === 'frozen' ? 'מוקפא' : 'סגור'
    lines.push(`שינוי סטטוס ל"${label}" יבטל את כל הפעולות הממתינות הבאות:`)
    lines.push('• מועדי מס ממתינים')
    lines.push('• דיווחי מע"מ פתוחים')
    lines.push('• דוחות שנתיים פתוחים')
    lines.push('• תיקים במשרד יועברו לארכיון')
  }

  if (entityTypeChanged) {
    if (lines.length > 0) lines.push('')
    lines.push('שינוי סוג ישות יבטל את כל מועדי המס הממתינים.')
  }

  return lines.join('\n')
}
