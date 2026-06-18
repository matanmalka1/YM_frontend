import { ArrowLeft, AlertTriangle, CheckCircle, FilePlus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { semanticMonoToneClasses, type SemanticTone } from '@/utils/semanticColors'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { useSeasonSummary } from '../hooks/useSeasonSummary'
import { DashboardBadge, DashboardPanel } from './DashboardLayout'

interface SeasonSummaryWidgetProps {
  sideContent?: React.ReactNode
}

export const SeasonSummaryWidget: React.FC<SeasonSummaryWidgetProps> = ({ sideContent }) => {
  const { stats, isPending } = useSeasonSummary()

  if (isPending) {
    return <SkeletonBlock height="h-28" width="w-full" rounded="xl" className="rounded-2xl" />
  }

  if (!stats || stats.total === 0) {
    const taxYear = stats?.taxYear
    const filingSeasonYear = stats?.filingSeasonYear
    return (
      <DashboardPanel className="border-dashed">
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
          <Link to="/tax/reports" className="group grid content-start">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <FilePlus className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-400">עונת הגשה {filingSeasonYear}</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">עדיין אין דוחות שנתיים לשנת המס {taxYear}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    לאחר יצירת הדוח הראשון יוצגו כאן התקדמות ההגשה, איחורים וסטטוסי עבודה.
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors group-hover:bg-primary-100">
                דוח שנתי {taxYear}
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-2 w-0 rounded-full bg-primary-500" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <SeasonStatusTile label="דוחות" value={0} tone="neutral" />
              <SeasonStatusTile label="התקדמות" value="0%" tone="info" />
            </div>
          </Link>
          {sideContent && (
            <div className="border-t border-slate-100 pt-5 xl:border-r xl:border-t-0 xl:pr-5 xl:pt-0">
              {sideContent}
            </div>
          )}
        </div>
      </DashboardPanel>
    )
  }

  return (
    <DashboardPanel>
      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)]">
        <Link to="/tax/reports" className="group grid content-start">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-400">עונת הגשה {stats.filingSeasonYear}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">דוחות שנתיים לשנת המס {stats.taxYear}</h3>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {stats.done} / {stats.total} דוחות הוגשו
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 transition-colors group-hover:bg-primary-100">
                דוח שנתי {stats.taxYear}
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>

              {stats.hasOverdue ? (
                <DashboardBadge tone="red" strong>
                  <AlertTriangle className="ml-1 h-3.5 w-3.5" />
                  {stats.overdueCount} באיחור
                </DashboardBadge>
              ) : (
                stats.done > 0 && (
                  <DashboardBadge tone="green">
                    <CheckCircle className="ml-1 h-3.5 w-3.5" />
                    ללא איחורים
                  </DashboardBadge>
                )
              )}

              <DashboardBadge tone="neutral">
                <TrendingUp className="ml-1 h-3.5 w-3.5" />
                {stats.completionPct}%
              </DashboardBadge>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn('h-2 rounded-full transition-all duration-700', stats.progressColor)}
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SeasonStatusTile label="לא התחילו" value={stats.notStarted} total={stats.total} tone="warning" />
            <SeasonStatusTile
              label="בעבודה"
              value={stats.inProgress}
              total={stats.total}
              tone="info"
              valueClassName={semanticMonoToneClasses.info}
            />
            <SeasonStatusTile
              label="הוגשו"
              value={stats.submitted}
              total={stats.total}
              tone="positive"
              valueClassName={semanticMonoToneClasses.positive}
            />
            <SeasonStatusTile label="סגורים" value={stats.closed} total={stats.total} tone="neutral" />
          </div>
        </Link>
        {sideContent && (
          <div className="border-t border-slate-100 pt-5 xl:border-r xl:border-t-0 xl:pr-5 xl:pt-0">{sideContent}</div>
        )}
      </div>
    </DashboardPanel>
  )
}

const SeasonStatusTile = ({
  label,
  value,
  total,
  tone = 'neutral',
  valueClassName,
}: {
  label: string
  value: number | string
  total?: number
  tone?: SemanticTone
  valueClassName?: string
}) => {
  const numericValue = typeof value === 'number' ? value : null
  const pct = numericValue !== null && total ? Math.round((numericValue / total) * 100) : null
  const progress = Math.max(0, Math.min(100, pct ?? 0))
  const toneClasses = seasonStatusTileToneClasses[tone]

  return (
    <div className={cn('relative min-w-0 overflow-hidden rounded-2xl border px-4 py-3 shadow-sm', toneClasses.surface)}>
      <div className={cn('absolute inset-y-3 right-0 w-1 rounded-l-full', toneClasses.accent)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              'truncate text-lg font-bold tabular-nums text-slate-900',
              numericValue !== 0 && valueClassName,
            )}
          >
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{label}</p>
        </div>
        {pct !== null && (
          <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums', toneClasses.badge)}>
            {pct}%
          </span>
        )}
      </div>
      {pct !== null && (
        <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/80">
          <div
            className={cn('h-full rounded-full transition-all duration-700', toneClasses.accent)}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

const seasonStatusTileToneClasses: Record<
  SemanticTone,
  {
    surface: string
    accent: string
    badge: string
  }
> = {
  neutral: {
    surface: 'border-slate-200 bg-slate-50',
    accent: 'bg-slate-500',
    badge: 'bg-white text-slate-700 ring-1 ring-slate-200',
  },
  info: {
    surface: 'border-info-200 bg-info-50',
    accent: 'bg-info-500',
    badge: 'bg-white text-info-700 ring-1 ring-info-200',
  },
  positive: {
    surface: 'border-positive-200 bg-positive-50',
    accent: 'bg-positive-500',
    badge: 'bg-white text-positive-700 ring-1 ring-positive-200',
  },
  warning: {
    surface: 'border-warning-200 bg-warning-50',
    accent: 'bg-warning-500',
    badge: 'bg-white text-warning-700 ring-1 ring-warning-200',
  },
  negative: {
    surface: 'border-negative-200 bg-negative-50',
    accent: 'bg-negative-500',
    badge: 'bg-white text-negative-700 ring-1 ring-negative-200',
  },
}

SeasonSummaryWidget.displayName = 'SeasonSummaryWidget'
