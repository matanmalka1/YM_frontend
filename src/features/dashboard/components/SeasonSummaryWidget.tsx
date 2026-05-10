import { ArrowLeft, AlertTriangle, CheckCircle, FilePlus, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { useSeasonSummary } from '../hooks/useSeasonSummary'
import { DashboardBadge, DashboardPanel } from './DashboardPrimitives'

interface SeasonSummaryWidgetProps {
  sideContent?: React.ReactNode
}

export const SeasonSummaryWidget: React.FC<SeasonSummaryWidgetProps> = ({ sideContent }) => {
  const { stats, isPending } = useSeasonSummary()

  if (isPending) {
    return <div className="h-28 animate-pulse rounded-2xl bg-gray-100" />
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
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FilePlus className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-400">עונת הגשה {filingSeasonYear}</p>
                  <h3 className="mt-1 text-xl font-bold text-gray-950">עדיין אין דוחות שנתיים לשנת המס {taxYear}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                    לאחר יצירת הדוח הראשון יוצגו כאן התקדמות ההגשה, איחורים וסטטוסי עבודה.
                  </p>
                </div>
              </div>

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors group-hover:bg-blue-100">
                דוח שנתי {taxYear}
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-2 w-0 rounded-full bg-blue-500" />
            </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <SeasonStatusTile label="דוחות" value={0} />
            <SeasonStatusTile label="התקדמות" value="0%" />
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
              <p className="truncate text-xs font-semibold text-gray-400">עונת הגשה {stats.filingSeasonYear}</p>
              <h3 className="mt-1 text-xl font-bold text-gray-950">דוחות שנתיים לשנת המס {stats.taxYear}</h3>
              <p className="mt-1 text-sm font-semibold text-gray-700">
                {stats.done} / {stats.total} דוחות הוגשו
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors group-hover:bg-blue-100">
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

          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn('h-2 rounded-full transition-all duration-700', stats.progressColor)}
              style={{ width: `${stats.completionPct}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SeasonStatusTile label="לא התחילו" value={stats.notStarted} />
            <SeasonStatusTile label="בעבודה" value={stats.inProgress} valueClassName={semanticMonoToneClasses.info} />
            <SeasonStatusTile label="הוגשו" value={stats.submitted} valueClassName={semanticMonoToneClasses.positive} />
            <SeasonStatusTile label="סגורים" value={stats.closed} />
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

const SeasonStatusTile = ({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: number | string
  valueClassName?: string
}) => (
  <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2">
    <p className={cn('truncate text-base font-bold text-slate-800', value !== 0 && valueClassName)}>{value}</p>
    <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">{label}</p>
  </div>
)

SeasonSummaryWidget.displayName = 'SeasonSummaryWidget'
