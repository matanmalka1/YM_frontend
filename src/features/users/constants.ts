import { makeLabelGetter } from '@/utils/labels'
import type { UserRole } from '@/types'
import type { components } from '@/types/generated'

type UserAuditAction = components['schemas']['AuditAction']

export const USER_AUDIT_ACTION_LABELS: Record<UserAuditAction, string> = {
  login_success: 'כניסה למערכת',
  login_failure: 'כניסה נכשלה',
  user_created: 'משתמש נוצר',
  user_updated: 'פרטים עודכנו',
  user_activated: 'הופעל',
  user_deactivated: 'הושבת',
  password_reset: 'סיסמה אופסה',
  logout: 'יציאה מהמערכת',
}

export const USER_ROLE_VALUES = ['advisor', 'secretary'] as const satisfies readonly UserRole[]

const ROLE_LABELS: Record<UserRole, string> = {
  advisor: 'יועץ',
  secretary: 'מזכירה',
}

export const getRoleLabel = makeLabelGetter(ROLE_LABELS)
