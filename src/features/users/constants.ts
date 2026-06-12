import { makeLabelGetter } from '@/utils/labels'
import type { UserRole } from './types'

export const USER_ROLE_VALUES = ['advisor', 'secretary'] as const satisfies readonly UserRole[]

const ROLE_LABELS: Record<UserRole, string> = {
  advisor: 'יועץ',
  secretary: 'מזכירה',
}

export const getRoleLabel = makeLabelGetter(ROLE_LABELS)
