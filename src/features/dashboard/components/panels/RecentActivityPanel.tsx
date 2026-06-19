import { CheckCircle2, Edit2, FileText, ReceiptText, Table2, UserPlus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { InlineEmptyState } from '@/components/ui/feedback/InlineEmptyState'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'
import type { RecentActivityItem } from '../../api'

type ActivityTone = 'info' | 'pos' | 'warn' | 'mut'

interface ActivityConfig {
  icon: LucideIcon
  tone: ActivityTone
}

const ACTIVITY_CONFIG: Record<string, ActivityConfig> = {
  client_created: { icon: UserPlus, tone: 'info' },
  client_updated: { icon: Edit2, tone: 'mut' },
  vat_approved: { icon: CheckCircle2, tone: 'pos' },
  charge_issued: { icon: ReceiptText, tone: 'warn' },
  document_uploaded: { icon: FileText, tone: 'mut' },
  report_submitted: { icon: Table2, tone: 'info' },
}

const TONE_CLASSES: Record<ActivityTone, string> = {
  info: 'bg-primary-50 text-primary-600',
  pos: 'bg-positive-50 text-positive-600',
  warn: 'bg-warning-50 text-warning-600',
  mut: 'bg-slate-100 text-slate-500',
}

interface ActivityRowProps {
  item: RecentActivityItem
  isLast: boolean
}

const ActivityRow = ({ item, isLast }: ActivityRowProps) => {
  const config = ACTIVITY_CONFIG[item.activity_type] ?? { icon: FileText, tone: 'mut' as ActivityTone }
  const { icon: Icon, tone } = config

  return (
    <li className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center">
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', TONE_CLASSES[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        {!isLast && <span className="my-1 w-0.5 flex-1 rounded-full bg-slate-100" />}
      </div>

      <Link
        to={item.href}
        className={cn('min-w-0 flex-1 hover:opacity-80 transition-opacity', !isLast && 'pb-4')}
        style={{ paddingTop: '4px' }}
      >
        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.label}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-slate-400">{item.client_name}</span>
          <time className="shrink-0 text-[11px] tabular-nums text-slate-400">
            {item.date} · {item.time}
          </time>
        </div>
      </Link>
    </li>
  )
}

export const RecentActivityPanel = ({ items, className }: { items: RecentActivityItem[]; className?: string }) => (
  <DashboardPanel className={cn('flex flex-col', className)}>
    <div className="border-b border-slate-100 px-5 py-4">
      <DashboardSectionHeader title="פעילות אחרונה" subtitle="עדכוני המשרד מהיומיים האחרונים" />
    </div>

    {items.length > 0 ? (
      <ul className="min-h-0 flex-1 overflow-y-auto p-5">
        {items.map((item, i) => (
          <ActivityRow key={item.id} item={item} isLast={i === items.length - 1} />
        ))}
      </ul>
    ) : (
      <InlineEmptyState title="אין פעילות אחרונה" className="py-8" />
    )}
  </DashboardPanel>
)
