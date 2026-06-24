import type { LucideIcon } from 'lucide-react'
import { FileText, Mail, Phone, Printer, Users } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/primitives/Badge'
import { PAGE_SIZE_MD } from '@/constants/pagination.constants'

export const CORRESPONDENCE_TYPES = ['call', 'letter', 'email', 'meeting', 'fax'] as const

export type CorrespondenceType = (typeof CORRESPONDENCE_TYPES)[number]

interface CorrespondenceTypeConfig {
  label: string
  icon: LucideIcon
  variant: BadgeVariant
  dotColor: string
}

export const CORRESPONDENCE_TYPE_CONFIG: Record<CorrespondenceType, CorrespondenceTypeConfig> = {
  call: {
    label: 'שיחה',
    icon: Phone,
    variant: 'info',
    dotColor: 'bg-primary-500',
  },
  letter: {
    label: 'מכתב',
    icon: FileText,
    variant: 'neutral',
    dotColor: 'bg-gray-400',
  },
  email: {
    label: 'אימייל',
    icon: Mail,
    variant: 'warning',
    dotColor: 'bg-orange-400',
  },
  meeting: {
    label: 'פגישה',
    icon: Users,
    variant: 'positive',
    dotColor: 'bg-positive-500',
  },
  fax: {
    label: 'פקס',
    icon: Printer,
    variant: 'neutral',
    dotColor: 'bg-gray-500',
  },
}

export const CORRESPONDENCE_TYPE_OPTIONS = CORRESPONDENCE_TYPES.map((value) => ({
  value,
  label: CORRESPONDENCE_TYPE_CONFIG[value].label,
}))

export const CORRESPONDENCE_LIST_PARAMS = {
  page: 1,
  page_size: PAGE_SIZE_MD,
} as const
