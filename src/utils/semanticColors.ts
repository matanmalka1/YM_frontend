export type SemanticTone = 'neutral' | 'info' | 'positive' | 'warning' | 'negative'

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

export const semanticStatToneClasses: Record<
  SemanticTone,
  { accent: string; border: string; iconBg: string; value: string; strip: string }
> = {
  neutral: {
    accent: 'bg-gray-400',
    border: 'border-r-2 border-r-gray-400',
    iconBg: 'bg-gray-50 text-gray-500',
    value: 'text-gray-700',
    strip: 'from-gray-500/10 to-transparent',
  },
  info: {
    accent: 'bg-info-500',
    border: 'border-r-2 border-r-info-500',
    iconBg: 'bg-info-50 text-info-500',
    value: 'text-info-700',
    strip: 'from-info-500/10 to-transparent',
  },
  positive: {
    accent: 'bg-positive-500',
    border: 'border-r-2 border-r-positive-500',
    iconBg: 'bg-positive-50 text-positive-500',
    value: 'text-positive-700',
    strip: 'from-positive-500/10 to-transparent',
  },
  warning: {
    accent: 'bg-warning-500',
    border: 'border-r-2 border-r-warning-500',
    iconBg: 'bg-warning-50 text-warning-500',
    value: 'text-warning-700',
    strip: 'from-warning-500/10 to-transparent',
  },
  negative: {
    accent: 'bg-negative-500',
    border: 'border-r-2 border-r-negative-500',
    iconBg: 'bg-negative-50 text-negative-500',
    value: 'text-negative-700',
    strip: 'from-negative-500/10 to-transparent',
  },
}

export const semanticDotClasses: Record<SemanticTone, string> = {
  neutral: 'bg-gray-400',
  info: 'bg-info-500',
  positive: 'bg-positive-500',
  warning: 'bg-warning-500',
  negative: 'bg-negative-500',
}
