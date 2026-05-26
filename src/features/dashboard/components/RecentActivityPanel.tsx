import { Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPanel } from './DashboardPrimitives'
import { InlineEmptyState } from '@/components/ui/feedback/InlineEmptyState'
import type { RecentActivityItem } from '../api'

export const RecentActivityPanel = ({ items }: { items: RecentActivityItem[] }) => (
  <DashboardPanel>
    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
      <h2 className="text-sm font-bold text-gray-950">פעילות אחרונה במערכת</h2>
      <Clock3 className="h-5 w-5 text-gray-900" />
    </div>

    {items.length > 0 ? (
      <ul className="divide-y divide-gray-100">
        {items.map((item) => (
          <Link key={item.id} to={item.href} className="block px-3 py-2.5 transition-colors hover:bg-gray-50">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">{item.label}</p>
              <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-gray-500">
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
