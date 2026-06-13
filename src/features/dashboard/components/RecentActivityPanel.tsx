import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from './DashboardPrimitives'
import { InlineEmptyState } from '@/components/ui/feedback/InlineEmptyState'
import { cn } from '@/utils/utils'
import type { RecentActivityItem } from '../api'

export const RecentActivityPanel = ({ items, className }: { items: RecentActivityItem[]; className?: string }) => (
  <DashboardPanel className={cn('flex flex-col', className)}>
    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
      <h2 className="text-sm font-bold text-slate-900">פעילות אחרונה</h2>
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Clock3 className="h-4 w-4" />
      </span>
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
