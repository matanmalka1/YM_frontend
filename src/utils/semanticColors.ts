export type SemanticTone = 'neutral' | 'info' | 'positive' | 'warning' | 'negative'
export type BadgeVariant = SemanticTone | 'primary' | 'purple'

type StatToneClasses = {
  accent: string
  border: string
  iconBg: string
  value: string
  strip: string
}

export const semanticBadgeClasses: Record<SemanticTone, string> = {
  neutral: 'bg-gray-100 text-gray-800',
  info: 'bg-info-100 text-info-800',
  positive: 'bg-positive-100 text-positive-800',
  warning: 'bg-warning-100 text-warning-800',
  negative: 'bg-negative-100 text-negative-800',
}

export const semanticSignalBadgeClasses: Record<SemanticTone, string> = {
  neutral: 'bg-gray-50 text-gray-600 ring-1 ring-gray-200',
  info: 'bg-info-50 text-info-700 ring-1 ring-info-200',
  positive: 'bg-positive-50 text-positive-700 ring-1 ring-positive-200',
  warning: 'bg-warning-50 text-warning-700 ring-1 ring-warning-200',
  negative: 'bg-negative-50 text-negative-700 ring-1 ring-negative-200',
}

export const semanticMonoToneClasses: Record<SemanticTone, string> = {
  neutral: 'text-gray-700',
  info: 'text-info-700',
  positive: 'text-positive-700',
  warning: 'text-warning-600 font-semibold',
  negative: 'text-negative-600',
}

export const semanticDotClasses: Record<SemanticTone, string> = {
  neutral: 'bg-gray-400',
  info: 'bg-info-500',
  positive: 'bg-positive-500',
  warning: 'bg-warning-500',
  negative: 'bg-negative-500',
}

export const semanticSoftSignalBadgeClasses: Record<SemanticTone, string> = {
  neutral: 'bg-gray-50 text-gray-600',
  info: 'bg-info-50 text-info-700',
  positive: 'bg-positive-50 text-positive-700',
  warning: 'bg-warning-50 text-warning-700',
  negative: 'bg-negative-50 text-negative-700',
}

const badgeExtras: Record<'primary' | 'purple', { solid: string; signal: string; soft: string }> = {
  primary: { solid: 'bg-primary-600 text-white', signal: 'bg-primary-50 text-primary-700 ring-1 ring-primary-200', soft: 'bg-primary-50 text-primary-700' },
  purple:  { solid: 'bg-purple-100 text-purple-700', signal: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200', soft: 'bg-purple-50 text-purple-700' },
}

export const badgeVariantClasses: Record<BadgeVariant, string> = {
  ...semanticBadgeClasses,
  primary: badgeExtras.primary.solid,
  purple: badgeExtras.purple.solid,
}
export const badgeSignalVariantClasses: Record<BadgeVariant, string> = {
  ...semanticSignalBadgeClasses,
  primary: badgeExtras.primary.signal,
  purple: badgeExtras.purple.signal,
}
export const badgeSoftSignalVariantClasses: Record<BadgeVariant, string> = {
  ...semanticSoftSignalBadgeClasses,
  primary: badgeExtras.primary.soft,
  purple: badgeExtras.purple.soft,
}

export const semanticStatToneClasses: Record<SemanticTone, StatToneClasses> = {
  neutral: {
    accent: semanticDotClasses.neutral,
    border: 'border-r-2 border-r-gray-400',
    iconBg: 'bg-gray-50 text-gray-500',
    value: 'text-gray-700',
    strip: 'from-gray-500/10 to-transparent',
  },
  info: {
    accent: semanticDotClasses.info,
    border: 'border-r-2 border-r-info-500',
    iconBg: 'bg-info-50 text-info-500',
    value: 'text-info-700',
    strip: 'from-info-500/10 to-transparent',
  },
  positive: {
    accent: semanticDotClasses.positive,
    border: 'border-r-2 border-r-positive-500',
    iconBg: 'bg-positive-50 text-positive-500',
    value: 'text-positive-700',
    strip: 'from-positive-500/10 to-transparent',
  },
  warning: {
    accent: semanticDotClasses.warning,
    border: 'border-r-2 border-r-warning-500',
    iconBg: 'bg-warning-50 text-warning-500',
    value: 'text-warning-700',
    strip: 'from-warning-500/10 to-transparent',
  },
  negative: {
    accent: semanticDotClasses.negative,
    border: 'border-r-2 border-r-negative-500',
    iconBg: 'bg-negative-50 text-negative-500',
    value: 'text-negative-700',
    strip: 'from-negative-500/10 to-transparent',
  },
}
