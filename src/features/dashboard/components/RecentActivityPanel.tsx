import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPanel, DashboardSectionHeader } from './DashboardLayout'
import { InlineEmptyState } from '@/components/ui/feedback/InlineEmptyState'
import { cn } from '@/utils/utils'
import type { RecentActivityItem } from '../api'

export const RecentActivityPanel = ({ items, className }: { items: RecentActivityItem[]; className?: string }) => (
  <DashboardPanel className={cn('flex flex-col', className)}>
    <div className="border-b border-slate-100 px-5 py-4">
      <DashboardSectionHeader title="פעילות אחרונה" icon={Clock3} />
    </div>

    {items.length > 0 ? (
      <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
        {items.map((item) => (
          <Link key={item.id} to={item.href} className="block px-5 py-3 transition-colors hover:bg-slate-50">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{item.label}</p>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-slate-400">
                <p className="truncate">{item.client_name}</p>
                <time className="shrink-0 tabular-nums">{`${item.date} ${item.time}`}</time>
              </div>
            </div>
          </Link>
        ))}
      </ul>
    ) : (
      <InlineEmptyState title="אין פעילות אחרונה" className="py-8" />
    )}
  </DashboardPanel>
)
