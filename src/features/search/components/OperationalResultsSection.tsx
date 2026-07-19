import { FileText, ListTodo, Receipt, TrendingUp, WalletCards } from 'lucide-react'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Badge } from '@/components/ui/primitives/Badge'
import { Card } from '@/components/ui/primitives/Card'
import { formatShekelAmount } from '@/utils/utils'
import type { OperationalSearchGroup, OperationalSearchItem, OperationalSearchResults } from '../api/contracts'
import { getOperationalStatusLabel, OPERATIONAL_RESULT_LABELS } from '../constants'
import { SEARCH_MESSAGES } from '../messages'

const GROUPS: Array<{
  key: keyof OperationalSearchResults
  type: OperationalSearchItem['result_type']
  icon: React.ReactNode
}> = [
  { key: 'tasks', type: 'task', icon: <ListTodo className="h-4 w-4" /> },
  { key: 'vat_work_items', type: 'vat_work_item', icon: <Receipt className="h-4 w-4" /> },
  { key: 'annual_reports', type: 'annual_report', icon: <FileText className="h-4 w-4" /> },
  { key: 'charges', type: 'charge', icon: <WalletCards className="h-4 w-4" /> },
  { key: 'advance_payments', type: 'advance_payment', icon: <TrendingUp className="h-4 w-4" /> },
]

const OperationalResultRow: React.FC<{ item: OperationalSearchItem }> = ({ item }) => (
  <ActionSurfaceLink variant="plainRow" to={item.href} className="border-b border-gray-100 last:border-b-0">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-semibold text-gray-900">{item.title}</span>
        <Badge variant="neutral" size="2xs">
          {getOperationalStatusLabel(item.status)}
        </Badge>
      </div>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        {item.client_name} · מס׳ לקוח {item.office_client_number}
        {item.detail ? ` · ${item.detail}` : ''}
      </p>
    </div>
    {item.amount != null && <span className="shrink-0 text-sm font-medium">{formatShekelAmount(item.amount)}</span>}
  </ActionSurfaceLink>
)

const OperationalGroupCard: React.FC<{
  group: OperationalSearchGroup
  type: OperationalSearchItem['result_type']
  icon: React.ReactNode
}> = ({ group, type, icon }) => (
  <Card
    title={OPERATIONAL_RESULT_LABELS[type]}
    subtitle={SEARCH_MESSAGES.operational.resultCount(group.total)}
    icon={icon}
    size="compact"
    disablePadding
  >
    {group.items.map((item) => (
      <OperationalResultRow key={`${item.result_type}-${item.id}`} item={item} />
    ))}
    {group.total > group.items.length && (
      <p className="px-3 py-2 text-xs text-gray-500">
        {SEARCH_MESSAGES.operational.moreResults(group.total - group.items.length)}
      </p>
    )}
  </Card>
)

export const OperationalResultsSection: React.FC<{ operational: OperationalSearchResults }> = ({ operational }) => {
  const visibleGroups = GROUPS.filter(({ key }) => operational[key].total > 0)
  if (visibleGroups.length === 0) return null

  return (
    <section className="space-y-3" aria-label={SEARCH_MESSAGES.operational.sectionLabel}>
      <h2 className="text-base font-semibold text-gray-900">{SEARCH_MESSAGES.operational.title}</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {visibleGroups.map(({ key, type, icon }) => (
          <OperationalGroupCard key={key} group={operational[key]} type={type} icon={icon} />
        ))}
      </div>
    </section>
  )
}
