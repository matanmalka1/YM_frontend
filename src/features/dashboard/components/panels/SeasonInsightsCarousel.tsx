import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { formatCount } from '@/utils/utils'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { useSeasonSummary } from '../../hooks/useSeasonSummary'
import type { VatDashboardStats, VatDashboardPeriodStat } from '../../api/contracts'
import { DASHBOARD_HREFS, VAT_STAT_LABELS } from '../../constants'
import { DashboardPanel } from '../shared/DashboardLayout'

/* ── shared ring + legend primitives ──────────────────────────────── */

const DonutRing = ({
  pct, size = 100, stroke = 10, color,
}: { pct: number; size?: number; stroke?: number; color?: string }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const fill = color ?? (pct >= 80 ? '#10B981' : pct >= 40 ? '#4F46E5' : '#F59E0B')
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF0F3" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
      />
      <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle"
        className="fill-slate-900 font-bold" style={{ fontSize: 19, fontFamily: 'inherit' }}>
        {pct}%
      </text>
      <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle"
        className="fill-slate-400" style={{ fontSize: 9, letterSpacing: '0.04em', fontFamily: 'inherit' }}>
        הושלמו
      </text>
    </svg>
  )
}

type LegendItem = { label: string; value: number; color: string }

const RingLegend = ({ items }: { items: LegendItem[] }) => (
  <ul className="flex flex-1 flex-col gap-2">
    {items.map((item) => (
      <li key={item.label} className="flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-[3px]" style={{ background: item.color }} />
        <span className="flex-1 text-xs font-medium text-slate-500">{item.label}</span>
        <span className="text-xs font-bold tabular-nums text-slate-800">{formatCount(item.value)}</span>
      </li>
    ))}
  </ul>
)

const SlideFooter = ({ left, right, warn }: { left: React.ReactNode; right?: React.ReactNode; warn?: React.ReactNode }) => (
  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500">
    <span className="tabular-nums">{left}</span>
    {warn ?? (right && <span className="tabular-nums">{right}</span>)}
  </div>
)

/* ── slide 0 : annual reports ──────────────────────────────────────── */

const SeasonSlide = () => {
  const { stats, isPending } = useSeasonSummary()

  if (isPending) return <SkeletonBlock height="h-24" width="w-full" className="rounded-2xl" />

  if (!stats || stats.total === 0) {
    return (
      <Link to="/tax/reports" className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-primary-600">
        אין דוחות שנתיים לעונה הנוכחית
      </Link>
    )
  }

  const legend: LegendItem[] = [
    { label: 'הוגשו',    value: stats.submitted,  color: '#10B981' },
    { label: 'נסגרו',    value: stats.closed,      color: '#6366F1' },
    { label: 'בתהליך',   value: stats.inProgress,  color: '#F59E0B' },
    { label: 'טרם החלו', value: stats.notStarted,  color: '#CBD5E1' },
  ]

  return (
    <Link to="/tax/reports" className="block transition-opacity hover:opacity-80">
      <div className="flex items-center gap-4">
        <DonutRing pct={stats.completionPct} color="#4F46E5" />
        <RingLegend items={legend} />
      </div>
      <SlideFooter
        left={`${formatCount(stats.total)} דוחות בעונה`}
        warn={stats.hasOverdue && (
          <span className="flex items-center gap-1 font-semibold text-negative-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {stats.overdueCount} באיחור
          </span>
        )}
      />
    </Link>
  )
}

/* ── slides 1-4 : vat / advance stats ─────────────────────────────── */

const StatSlide = ({ stat, href }: { stat: VatDashboardPeriodStat; href?: string }) => {
  const pendingColor = stat.pending === 0 ? '#CBD5E1' : stat.completion_percent >= 80 ? '#F59E0B' : '#EF4444'
  const legend: LegendItem[] = [
    { label: 'הוגשו',   value: stat.submitted, color: '#10B981' },
    { label: 'ממתינים', value: stat.pending,   color: pendingColor },
  ]

  const content = (
    <div>
      <div className="flex items-center gap-4">
        <DonutRing pct={stat.completion_percent} />
        <RingLegend items={legend} />
      </div>
      <SlideFooter left={stat.period_label} right={`${formatCount(stat.required)} בסך הכל`} />
    </div>
  )

  if (href) return <Link to={href} className="block transition-opacity hover:opacity-80">{content}</Link>
  return content
}

/* ── carousel ──────────────────────────────────────────────────────── */

const SLIDE_DEFS = [
  { key: 'season',            label: 'דוחות שנתיים'                  },
  { key: 'vat-monthly',       label: VAT_STAT_LABELS.vatMonthly       },
  { key: 'vat-bimonthly',     label: VAT_STAT_LABELS.vatBimonthly     },
  { key: 'advance-monthly',   label: VAT_STAT_LABELS.advanceMonthly   },
  { key: 'advance-bimonthly', label: VAT_STAT_LABELS.advanceBimonthly },
] as const

interface SeasonInsightsCarouselProps {
  vatStats: VatDashboardStats
}

export const SeasonInsightsCarousel = ({ vatStats }: SeasonInsightsCarouselProps) => {
  const { monthly, bimonthly, advance_payments: ap } = vatStats
  const [slide, setSlide] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const total = SLIDE_DEFS.length

  /* Slides are in reversed DOM order (4→0) so scrollLeft=0 = slide 4, max = slide 0.
     Swipe right (scrollLeft ↓) = next slide — RTL natural direction. */
  const domPos = useCallback((i: number) => (total - 1 - i) * (trackRef.current?.clientWidth ?? 0), [total])

  useLayoutEffect(() => {
    const el = trackRef.current
    if (el) el.scrollLeft = (total - 1) * el.clientWidth
  }, [total])

  const goTo = useCallback((i: number) => {
    setSlide(i)
    const el = trackRef.current
    if (el) el.scrollTo({ left: domPos(i), behavior: 'smooth' })
  }, [domPos])

  const prev = () => goTo((slide - 1 + total) % total)
  const next = () => goTo((slide + 1) % total)

  /* sync active dot when user swipes natively */
  const onScroll = () => {
    const el = trackRef.current
    if (!el) return
    const domIdx = Math.round(el.scrollLeft / el.clientWidth)
    const i = total - 1 - domIdx
    if (i !== slide && i >= 0 && i < total) setSlide(i)
  }

  return (
    <DashboardPanel>
      {/* header */}
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-4">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {SLIDE_DEFS[slide].label}
        </span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-1">
            {SLIDE_DEFS.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() => goTo(i)}
                aria-label={s.label}
                className={cn(
                  'rounded-full transition-all duration-200',
                  i === slide ? 'h-1.5 w-4 bg-primary-500' : 'h-1.5 w-1.5 bg-slate-200 hover:bg-slate-300',
                )}
              />
            ))}
          </div>
          <button type="button" onClick={prev} aria-label="שקף קודם"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={next} aria-label="שקף הבא"
            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/*
        dir="ltr": LTR scroll origin so scrollLeft=0 shows slide 0 correctly.
        overflow-x scroll + snap: browser-native swipe, no RTL clip issues.
        scrollbar hidden via CSS.
      */}
      <div
        ref={trackRef}
        dir="ltr"
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {/* reversed DOM order: swipe right = lower scrollLeft = next slide (RTL) */}
        {[
          <StatSlide key="advance-bimonthly" stat={ap.bimonthly} href={DASHBOARD_HREFS.advancePayments(ap.bimonthly.period.slice(0, 4), 2)} />,
          <StatSlide key="advance-monthly"   stat={ap.monthly}   href={DASHBOARD_HREFS.advancePayments(ap.monthly.period.slice(0, 4), 1)} />,
          <StatSlide key="vat-bimonthly"     stat={bimonthly}    href={DASHBOARD_HREFS.vat(bimonthly.period, 'bimonthly')} />,
          <StatSlide key="vat-monthly"       stat={monthly}      href={DASHBOARD_HREFS.vat(monthly.period, 'monthly')} />,
          <SeasonSlide key="season" />,
        ].map((el, i) => (
          <div key={i} dir="rtl" className="w-full shrink-0 snap-center px-5 pb-5">
            {el}
          </div>
        ))}
      </div>
    </DashboardPanel>
  )
}

SeasonInsightsCarousel.displayName = 'SeasonInsightsCarousel'
