import { cn } from '../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'

interface MonoValueProps {
  value: string | number | null | undefined
  tone?: 'neutral' | 'positive' | 'negative' | 'warning' | 'critical'
  /** Days mode: derives tone from urgency thresholds (60/90 days) */
  format?: 'amount' | 'days'
  /** Days mode: forces neutral tone regardless of value */
  isInactive?: boolean
  className?: string
}

const toneClass: Record<NonNullable<MonoValueProps['tone']>, string> = {
  neutral: semanticMonoToneClasses.neutral,
  positive: semanticMonoToneClasses.positive,
  negative: semanticMonoToneClasses.negative,
  warning: semanticMonoToneClasses.warning,
  critical: `${semanticMonoToneClasses.negative} font-bold`,
}

const daysTone = (days: number, isInactive?: boolean): NonNullable<MonoValueProps['tone']> => {
  if (isInactive) return 'neutral'
  if (days > 90) return 'critical'
  if (days > 60) return 'warning'
  return 'neutral'
}

export const MonoValue: React.FC<MonoValueProps> = ({ value, tone = 'neutral', format, isInactive, className }) => {
  if (value == null) return <span className="text-gray-400">—</span>

  const resolvedTone = format === 'days' && typeof value === 'number' ? daysTone(value, isInactive) : tone

  return (
    <span
      className={cn('font-mono text-sm tabular-nums', format !== 'days' && 'font-medium', toneClass[resolvedTone], className)}
    >
      {value}
    </span>
  )
}

MonoValue.displayName = 'MonoValue'
