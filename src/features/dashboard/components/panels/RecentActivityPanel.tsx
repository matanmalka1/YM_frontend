import { CheckCircle2, Edit2, FileText, ReceiptText, Table2, UserPlus, History } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { IconChip } from '@/components/ui/primitives/IconChip'
import type { IconChipTone } from '@/utils/semanticColors'
import { DashboardPanel, DashboardSectionHeader } from '../shared/DashboardLayout'
import type { RecentActivityItem } from '../../api'
import { DASHBOARD_MESSAGES } from '../../messages'

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

const ACTIVITY_CHIP_TONES: Record<ActivityTone, IconChipTone> = {
  info: 'primary',
  pos: 'positive',
  warn: 'warning',
  mut: 'neutral',
}

interface ActivityRowProps {
  item: RecentActivityItem
  isLast: boolean
}

const ActivityRow = ({ item, isLast }: ActivityRowProps) => {
  const config = ACTIVITY_CONFIG[item.activity_type] ?? { icon: FileText, tone: 'mut' as ActivityTone }
  const { icon: Icon, tone } = config

  return (
    <li className="flex gap-3.5">
      <div className="flex shrink-0 flex-col items-center">
        <IconChip icon={Icon} size="sm" tone={ACTIVITY_CHIP_TONES[tone]} ring />
        {!isLast && <span className="my-1.5 w-0.5 flex-1 rounded-full bg-slate-200/70" />}
      </div>

      <Link
        to={item.href}
        className={cn('min-w-0 flex-1 rounded-2xl p-2.5 transition-colors hover:bg-slate-50', !isLast && 'pb-4')}
      >
        <p className="text-sm font-semibold text-slate-800 leading-tight">{item.label}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-slate-500">{item.client_name}</span>
          <time className="shrink-0 rounded-md bg-slate-100/80 px-2 py-0.5 text-2xs tabular-nums text-slate-400">
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
      <DashboardSectionHeader
        icon={History}
        title={DASHBOARD_MESSAGES.recentActivity.title}
        subtitle={DASHBOARD_MESSAGES.recentActivity.subtitle}
        count={items.length > 0 ? items.length : undefined}
      />
    </div>

    {items.length > 0 ? (
      <ul className="min-h-0 flex-1 overflow-y-auto p-5">
        {items.map((item, i) => (
          <ActivityRow key={item.id} item={item} isLast={i === items.length - 1} />
        ))}
      </ul>
    ) : (
      <InlineState title={DASHBOARD_MESSAGES.recentActivity.empty} className="py-8" />
    )}
  </DashboardPanel>
)

RecentActivityPanel.displayName = 'RecentActivityPanel'
