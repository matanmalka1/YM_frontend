import { User, FileText } from 'lucide-react'
import { getResultTypeLabel } from '../../../constants/filterOptions.constants'
import type { BadgeVariant } from '@/utils/semanticColors'

export const getResultIcon = (resultType: string) => {
  if (resultType === 'binder') return <FileText className="h-3.5 w-3.5" />
  if (resultType === 'client') return <User className="h-3.5 w-3.5" />
  return null
}

export const getResultVariant = (resultType: string): BadgeVariant => {
  if (resultType === 'binder') return 'primary'
  if (resultType === 'client') return 'positive'
  return 'neutral'
}

export const getResultLabel = (resultType: string) => getResultTypeLabel(resultType)
